import mqtt, { MqttClient } from "mqtt";
import { Logger } from "@/shared/utils/logger/logger";
import {
  RetryHandler,
  RetryOptions,
} from "@/shared/utils/helpers/retry-helper";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { filter, share, map } from "rxjs/operators";
import { createMqttCertConfig } from "@/shared/utils/helpers/mqtt-service-helper";
import { getMqttConfig } from "@/shared/utils/helpers/mqtt-service-helper";

export type MqttMessage<T = unknown> = {
  topic: string;
  payload: T;
  timestamp: Date;
  qos?: 0 | 1 | 2;
};

export interface MqttDataSourceConfig {
  brokerUrl: string;
  clientId?: string;
  username?: string;
  password?: string;
  enableRetry?: boolean;
  retryOptions?: RetryOptions;
  connectTimeout?: number;
  reconnectPeriod?: number;
  keepAlive?: number;
  qos?: 0 | 1 | 2;
  onConnectionLost?: () => void;
  onReconnect?: () => void;
  enableLogging?: boolean;
  // Add certificate options
  ca?: string | Buffer | Array<string | Buffer>;
  cert?: string | Buffer;
  key?: string | Buffer;
  rejectUnauthorized?: boolean;
}

export class MqttDataSource {
  private client: MqttClient | null = null;
  private config: MqttDataSourceConfig;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  // Replace single subscription with multiple subscriptions - keep as unknown
  private subscriptions: Map<
    string,
    {
      callback: (message: MqttMessage<unknown>) => void;
      errorHandler?: (error: Error) => void;
      qos: 0 | 1 | 2;
    }
  > = new Map();

  // Observable subjects for reactive support
  private messageSubject = new Subject<MqttMessage<unknown>>();
  private connectionStatusSubject = new BehaviorSubject<{
    connected: boolean;
    connecting: boolean;
    error?: Error;
  }>({ connected: false, connecting: false });

  constructor(config: MqttDataSourceConfig) {
    this.config = {
      brokerUrl: config.brokerUrl,
      clientId: optionalValue(config.clientId).orDefault(
        `webapp_${Date.now()}`
      ),
      username: config.username,
      password: config.password,
      enableRetry: optionalValue(config.enableRetry).orTrue(),
      retryOptions: optionalValue(config.retryOptions).orDefault({
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      }),
      connectTimeout: optionalValue(config.connectTimeout).orDefault(30000),
      reconnectPeriod: optionalValue(config.reconnectPeriod).orDefault(5000),
      keepAlive: optionalValue(config.keepAlive).orDefault(60),
      qos: optionalValue(config.qos).orDefault(0),
      onConnectionLost: optionalValue(config.onConnectionLost).orDefault(() =>
        this.defaultConnectionLostHandler()
      ),
      onReconnect: optionalValue(config.onReconnect).orDefault(() =>
        this.defaultReconnectHandler()
      ),
      enableLogging: config.enableLogging,
      // Add certificate configuration
      ca: config.ca,
      cert: config.cert,
      key: config.key,
      rejectUnauthorized: optionalValue(config.rejectUnauthorized).orDefault(
        true
      ),
    };
  }

  /**
   * Connect to MQTT broker with retry logic
   */
  async connect(): Promise<void> {
    if (optionalValue(this.connectionPromise).isPresent()) {
      return this.connectionPromise!;
    }

    if (this.isConnecting) {
      return;
    }

    this.connectionPromise = this.config.enableRetry
      ? this.connectWithRetry()
      : this.performConnection();

    return this.connectionPromise;
  }

  /**
   * Connect with retry logic
   */
  private async connectWithRetry(): Promise<void> {
    const result = await RetryHandler.withRetry(
      () => this.performConnection(),
      {
        ...this.config.retryOptions,
        retryCondition: (error: unknown) => {
          this.log("Checking retry condition for connection error:", error);
          return this.connectionAttempts < this.maxConnectionAttempts;
        },
        onRetry: (attempt, error) => {
          this.log(`Connection retry attempt ${attempt}:`, error);
        },
      }
    );

    if (!result.success) {
      this.logError(
        "Failed to connect after all retry attempts:",
        result.error
      );
      throw result.error;
    }
  }

  /**
   * Perform actual connection
   */
  private async performConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.connectionAttempts++;

        this.log("Connecting to MQTT broker:", this.config);

        this.client = mqtt.connect(this.config.brokerUrl, {
          clientId: this.config.clientId,
          username: optionalValue(this.config.username).isNotNullOrEmpty()
            ? this.config.username
            : undefined,
          password: optionalValue(this.config.password).isNotNullOrEmpty()
            ? this.config.password
            : undefined,
          // Disable built-in reconnection when enableRetry is false
          reconnectPeriod: this.config.enableRetry
            ? this.config.reconnectPeriod
            : 0,
          connectTimeout: this.config.connectTimeout,
          keepalive: this.config.keepAlive,
          clean: true,
          // Add certificate configuration
          ca: Array.isArray(this.config.ca)
            ? this.config.ca.every((item) => typeof item === "string")
              ? (this.config.ca as string[])
              : this.config.ca.every((item) => Buffer.isBuffer(item))
              ? (this.config.ca as Buffer[])
              : undefined
            : this.config.ca,
          cert: this.config.cert,
          key: this.config.key,
          rejectUnauthorized: optionalValue(
            this.config.rejectUnauthorized
          ).orDefault(true),
        });

        this.setupEventHandlers(resolve, reject);
      } catch (error) {
        this.isConnecting = false;
        this.logError("Failed to create MQTT client:", error);
        reject(error);
      }
    });
  }

  /**
   * Setup MQTT client event handlers
   */
  private setupEventHandlers(
    resolve: () => void,
    reject: (error: Error) => void
  ): void {
    if (!this.client) return;

    const client = this.client!;

    client.on("connect", () => {
      this.log("Connected to MQTT broker");
      this.isConnecting = false;
      this.connectionAttempts = 0;
      this.connectionPromise = null;

      // Update connection status
      this.connectionStatusSubject.next({ connected: true, connecting: false });

      this.resubscribeAll();
      resolve();
    });

    client.on("error", (error) => {
      this.logError("MQTT connection error:", error);
      this.isConnecting = false;

      // Update connection status
      this.connectionStatusSubject.next({
        connected: false,
        connecting: false,
        error,
      });

      if (this.connectionAttempts === 1) {
        reject(error);
      }
    });

    client.on("message", (topic, message, packet) => {
      const qosValue = optionalValue(packet.qos).orZero() as 0 | 1 | 2;
      this.handleMessage(topic, message, qosValue);
    });

    client.on("reconnect", () => {
      if (!this.config.enableRetry) {
        // Prevent reconnection if retry is disabled
        this.client?.end(true);
        return;
      }
      this.log("Reconnecting to MQTT broker");
      this.config.onReconnect?.();
    });

    client.on("close", () => {
      this.log("MQTT connection closed");
      this.config.onConnectionLost?.();
    });

    client.on("offline", () => {
      this.log("MQTT client offline");
    });

    client.on("disconnect", () => {
      this.log("MQTT client disconnected");
    });
  }

  /**
   * Subscribe to MQTT topic and return an Observable
   */
  subscribeToTopic<T = unknown>({
    topic,
    options = { qos: 0, autoConnect: true },
  }: {
    topic: string;
    options?: {
      qos?: 0 | 1 | 2;
      autoConnect?: boolean;
    };
  }): Observable<MqttMessage<T>> {
    const qos = options?.qos || 0;
    const autoConnect = options?.autoConnect !== false;

    return new Observable<MqttMessage<T>>((subscriber) => {
      const subscriptionKey = `${topic}_${qos}`;

      // Type-safe callback that properly converts unknown to T
      const messageCallback = (message: MqttMessage<unknown>) => {
        if (this.topicMatches(message.topic, topic)) {
          // Safe casting with explicit type assertion
          const typedMessage: MqttMessage<T> = {
            topic: message.topic,
            payload: message.payload as T,
            timestamp: message.timestamp,
            qos: message.qos,
          };
          subscriber.next(typedMessage);
        }
      };

      const errorHandler = (error: Error) => {
        subscriber.error(error);
      };

      // Store subscription with type-erased callback
      this.subscriptions.set(subscriptionKey, {
        callback: messageCallback, // This works because unknown is the top type
        errorHandler,
        qos,
      });

      const setupSubscription = async () => {
        try {
          if (autoConnect) {
            await this.connect();
          }

          if (this.client?.connected) {
            await this.performSubscription(topic, qos);
          }
        } catch (error) {
          errorHandler(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      };

      setupSubscription();

      // Cleanup function
      return () => {
        this.subscriptions.delete(subscriptionKey);
        if (this.client?.connected) {
          this.client.unsubscribe(topic, (error) => {
            if (error) {
              this.logError(`Failed to unsubscribe from ${topic}:`, error);
            }
          });
        }
      };
    }).pipe(share()); // Share the subscription among multiple observers
  }

  /**
   * Get connection status as Observable
   */
  getConnectionStatus$(): Observable<{
    connected: boolean;
    connecting: boolean;
    error?: Error;
  }> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Get all messages as Observable (can be filtered by topic)
   */
  getAllMessages$(): Observable<MqttMessage<unknown>> {
    return this.messageSubject.asObservable();
  }

  /**
   * Filter messages by topic pattern with type casting
   */
  getMessagesByTopic$<T = unknown>(
    topicPattern: string
  ): Observable<MqttMessage<T>> {
    return this.messageSubject.pipe(
      filter((message) => this.topicMatches(message.topic, topicPattern)),
      map(
        (message): MqttMessage<T> => ({
          topic: message.topic,
          payload: message.payload as T,
          timestamp: message.timestamp,
          qos: message.qos,
        })
      )
    );
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer, qos?: 0 | 1 | 2): void {
    try {
      const payload = this.parseMessage<unknown>(message);
      const mqttMessage: MqttMessage<unknown> = {
        topic,
        payload,
        timestamp: new Date(),
        qos,
      };

      this.log(`Received message on topic ${topic}:`, payload);

      // Emit to message subject
      this.messageSubject.next(mqttMessage);

      // Call all matching subscription callbacks
      for (const [, subscription] of this.subscriptions) {
        try {
          subscription.callback(mqttMessage);
        } catch (error) {
          this.logError("Error in subscription callback:", error);
          if (subscription.errorHandler) {
            subscription.errorHandler(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      }
    } catch (error) {
      this.logError("Error handling MQTT message:", error);
    }
  }

  private topicMatches(topic: string, pattern: string): boolean {
    if (pattern === "#") return true; // Match all topics
    const regex = new RegExp(
      "^" +
        pattern
          .replace(/\+/g, "[^/]+") // Single-level wildcard
          .replace(/#/g, ".*") + // Multi-level wildcard
        "$"
    );
    return regex.test(topic);
  }

  private parseMessage<TPayload>(message: Buffer): TPayload {
    const messageString = message.toString();
    try {
      return JSON.parse(messageString) as TPayload;
    } catch {
      // If parsing fails, return the raw string
      return messageString as unknown as TPayload;
    }
  }

  /**
   * Perform actual MQTT subscription
   */
  private async performSubscription(
    topic: string,
    qos: 0 | 1 | 2
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const clientWrapper = optionalValue(this.client);
      if (clientWrapper.isEmpty()) {
        reject(new Error("MQTT client not initialized"));
        return;
      }

      this.client!.subscribe(topic, { qos }, (error) => {
        const errorWrapper = optionalValue(error);
        if (errorWrapper.isPresent()) {
          this.logError(`Failed to subscribe to topic ${topic}:`, error);
          reject(error);
        } else {
          this.log(`Subscribed to topic: ${topic} with QoS: ${qos}`);
          resolve();
        }
      });
    });
  }

  /**
   * Unsubscribe from current MQTT topic
   */
  async unsubscribe(): Promise<void> {
    const clientWrapper = optionalValue(this.client);
    if (clientWrapper.isEmpty() || !this.client!.connected) {
      throw new Error("MQTT client not connected");
    }

    const unsubscribePromises = Array.from(this.subscriptions.keys()).map(
      (subscriptionKey) => {
        const topic = subscriptionKey.split("_")[0]; // Extract topic from key
        return new Promise<void>((resolve, reject) => {
          this.client!.unsubscribe(topic, (error) => {
            const errorWrapper = optionalValue(error);
            if (errorWrapper.isPresent()) {
              this.logError(`Failed to unsubscribe from ${topic}:`, error);
              reject(error);
            } else {
              this.log(`Unsubscribed from topic: ${topic}`);
              resolve();
            }
          });
        });
      }
    );

    await Promise.all(unsubscribePromises);
    this.subscriptions.clear();
  }

  /**
   * Publish message to MQTT topic
   */
  async publish<TPayload = unknown>(
    topic: string,
    message: TPayload,
    options?: {
      qos?: 0 | 1 | 2;
      retain?: boolean;
    }
  ): Promise<void> {
    const topicWrapper = optionalValue(topic);
    if (topicWrapper.isNullOrEmpty()) {
      throw new Error("Topic cannot be null or empty");
    }

    await this.connect();

    const clientWrapper = optionalValue(this.client);
    if (clientWrapper.isEmpty() || !this.client!.connected) {
      throw new Error("MQTT client not connected");
    }

    const payload =
      typeof message === "string" ? message : JSON.stringify(message);
    const qos = options?.qos || 0;
    const retain = optionalValue(options?.retain).orFalse();

    return new Promise((resolve, reject) => {
      this.client!.publish(topic, payload, { qos, retain }, (error) => {
        const errorWrapper = optionalValue(error);
        if (errorWrapper.isPresent()) {
          this.logError(`Failed to publish to topic ${topic}:`, error);
          reject(error);
        } else {
          this.log(`Published message to topic ${topic}:`, payload);
          resolve();
        }
      });
    });
  }

  /**
   * Resubscribe to all topics after reconnection
   */
  private async resubscribeAll(): Promise<void> {
    for (const [subscriptionKey, subscription] of this.subscriptions) {
      const topic = subscriptionKey.split("_")[0]; // Extract topic from key
      try {
        await this.performSubscription(topic, subscription.qos);
      } catch (error) {
        this.logError(`Failed to resubscribe to topic ${topic}:`, error);
        if (subscription.errorHandler) {
          subscription.errorHandler(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const clientWrapper = optionalValue(this.client);
      if (clientWrapper.isEmpty() || !this.client!.connected) {
        this.log("MQTT client already disconnected");
        resolve();
        return;
      }

      this.client!.end(false, {}, (error) => {
        const errorWrapper = optionalValue(error);
        if (errorWrapper.isPresent()) {
          this.logError("Failed to disconnect MQTT client:", error);
          reject(error);
        } else {
          this.log("Disconnected from MQTT broker");
          this.connectionStatusSubject.next({
            connected: false,
            connecting: false,
          });
          resolve();
        }
      });
    });
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return optionalValue(this.client?.connected).orFalse();
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    attempts: number;
    subscribedTopic: string[] | null;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      attempts: this.connectionAttempts,
      subscribedTopic: this.subscriptions.size
        ? Array.from(this.subscriptions.keys()).map((key) => key.split("_")[0])
        : null,
    };
  }

  /**
   * Set connection handlers
   */
  setConnectionHandlers(handlers: {
    onConnectionLost?: () => void;
    onReconnect?: () => void;
  }): void {
    const connectionLostWrapper = optionalValue(handlers.onConnectionLost);
    const reconnectWrapper = optionalValue(handlers.onReconnect);

    if (connectionLostWrapper.isPresent()) {
      this.config.onConnectionLost = handlers.onConnectionLost!;
    }
    if (reconnectWrapper.isPresent()) {
      this.config.onReconnect = handlers.onReconnect!;
    }
  }

  /**
   * Default connection lost handler
   */
  private defaultConnectionLostHandler(): void {
    this.log("Connection lost - using default handler");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mqtt:connection-lost", {
          detail: { timestamp: new Date() },
        })
      );
    }
  }

  /**
   * Default reconnect handler
   */
  private defaultReconnectHandler(): void {
    this.log("Reconnecting - using default handler");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("mqtt:reconnect", {
          detail: { timestamp: new Date() },
        })
      );
    }
  }

  /**
   * Logging methods
   */
  private log(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      Logger.info("MqttDataSource", message, ...args);
    }
  }

  private logError(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      Logger.error("MqttDataSource", message, ...args);
    }
  }

  /**
   * Get client instance for advanced usage
   */
  get instance(): MqttClient | null {
    return optionalValue(this.client).orNull();
  }
}

// Create typed instance factory
export function createMqttDataSource(
  config: MqttDataSourceConfig
): MqttDataSource {
  return new MqttDataSource(config);
}

// Enhanced factory function with type support
export function createTypedMqttDataSource<T = unknown>(
  config: MqttDataSourceConfig
): {
  dataSource: MqttDataSource;
  subscribeToTopic: (
    topic: string,
    options?: { qos?: 0 | 1 | 2; autoConnect?: boolean }
  ) => Observable<MqttMessage<T>>;
  getMessagesByTopic: (topicPattern: string) => Observable<MqttMessage<T>>;
} {
  const dataSource = new MqttDataSource(config);

  return {
    dataSource,
    subscribeToTopic: (topic: string, options?) =>
      dataSource.subscribeToTopic<T>({ topic, options }),
    getMessagesByTopic: (topicPattern: string) =>
      dataSource.getMessagesByTopic$<T>(topicPattern),
  };
}

// Enhanced factory function with certificate loading
export async function createMqttDataSourceWithCerts(
  config: MqttDataSourceConfig & {
    certificateConfig?: {
      caCertName?: string;
      clientCertName?: string;
      clientKeyName?: string;
      rejectUnauthorized?: boolean;
    };
  }
): Promise<MqttDataSource> {
  let finalConfig = { ...config };

  // Load certificates if configuration is provided
  if (config.certificateConfig) {
    try {
      const certConfig = await createMqttCertConfig(config.certificateConfig);
      finalConfig = {
        ...finalConfig,
        ca: certConfig.ca,
        cert: certConfig.cert,
        key: certConfig.key,
        rejectUnauthorized: certConfig.rejectUnauthorized,
      };
    } catch (error) {
      Logger.error(
        "MqttDataSource",
        "Failed to load certificates, falling back to insecure connection:",
        error
      );
      finalConfig.rejectUnauthorized = false;
    }
  }

  return new MqttDataSource(finalConfig);
}

// Enhanced typed factory with certificate loading
export async function createTypedMqttDataSourceWithCerts<T = unknown>(
  config: MqttDataSourceConfig & {
    certificateConfig?: {
      caCertName?: string;
      clientCertName?: string;
      clientKeyName?: string;
      rejectUnauthorized?: boolean;
    };
  }
): Promise<{
  dataSource: MqttDataSource;
  subscribeToTopic: (
    topic: string,
    options?: { qos?: 0 | 1 | 2; autoConnect?: boolean }
  ) => Observable<MqttMessage<T>>;
  getMessagesByTopic: (topicPattern: string) => Observable<MqttMessage<T>>;
}> {
  const dataSource = await createMqttDataSourceWithCerts(config);

  return {
    dataSource,
    subscribeToTopic: (topic: string, options?) =>
      dataSource.subscribeToTopic<T>({ topic, options }),
    getMessagesByTopic: (topicPattern: string) =>
      dataSource.getMessagesByTopic$<T>(topicPattern),
  };
}

// Define specific types for your use cases
export interface MqttUsageResponse {
  "1phases": Array<{ devid: string; p: number }>;
  "3phases": Array<{ devid: string; pR: number; pS: number; pT: number }>;
}

export interface DeviceDataPayload {
  deviceId: string;
  power: number;
  voltage: number;
  current: number;
  timestamp?: string;
}

// Update your typed instances to use certificates by default
export const usageMqttDataSource = (async () => {
  const configHelper = getMqttConfig();
  try {
    return await createTypedMqttDataSourceWithCerts<MqttUsageResponse>({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: false,
      enableLogging: true,
      certificateConfig: {
        caCertName: "ca-mosquitto.pem",
        rejectUnauthorized: true,
      },
    });
  } catch (error) {
    Logger.warn(
      "UsageMqttDataSource",
      "Failed to create secure instance, falling back to insecure:",
      error
    );
    return createTypedMqttDataSource<MqttUsageResponse>({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      rejectUnauthorized: false,
    });
  }
})();

export const deviceMqttDataSource = (async () => {
  try {
    const configHelper = getMqttConfig();
    return await createTypedMqttDataSourceWithCerts<DeviceDataPayload>({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      certificateConfig: {
        caCertName: "ca-mosquitto.pem",
        rejectUnauthorized: true,
      },
    });
  } catch (error) {
    Logger.warn(
      "DeviceMqttDataSource",
      "Failed to create secure instance, falling back to insecure:",
      error
    );
    const configHelper = getMqttConfig();
    return createTypedMqttDataSource<DeviceDataPayload>({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      rejectUnauthorized: false,
    });
  }
})();

// Update existing instances to use certificates
export const mqttDataSource = (async () => {
  try {
    const configHelper = getMqttConfig();
    return await createMqttDataSourceWithCerts({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      certificateConfig: {
        caCertName: "ca-mosquitto.pem",
        rejectUnauthorized: true,
      },
    });
  } catch (error) {
    Logger.warn(
      "MqttDataSource",
      "Failed to create secure instance, falling back to insecure:",
      error
    );
    const configHelper = getMqttConfig();
    return createMqttDataSource({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      rejectUnauthorized: false,
    });
  }
})();

export const generalMqttDataSource = (async () => {
  try {
    const configHelper = getMqttConfig();
    return await createMqttDataSourceWithCerts({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      certificateConfig: {
        caCertName: "ca-mosquitto.pem",
        rejectUnauthorized: true,
      },
    });
  } catch (error) {
    Logger.warn(
      "GeneralMqttDataSource",
      "Failed to create secure instance, falling back to insecure:",
      error
    );
    const configHelper = getMqttConfig();
    return createMqttDataSource({
      brokerUrl: configHelper.brokerUrl,
      username: configHelper.username,
      password: configHelper.password,
      enableRetry: true,
      enableLogging: true,
      rejectUnauthorized: false,
    });
  }
})();

// Create a simplified function for creating secure instances
export const createSecureMqttInstance = async <T = unknown>(
  config?: Partial<MqttDataSourceConfig>
): Promise<{
  dataSource: MqttDataSource;
  subscribeToTopic: (
    topic: string,
    options?: { qos?: 0 | 1 | 2; autoConnect?: boolean }
  ) => Observable<MqttMessage<T>>;
  getMessagesByTopic: (topicPattern: string) => Observable<MqttMessage<T>>;
}> => {
  const configHelper = getMqttConfig();
  const defaultConfig = {
    brokerUrl: configHelper.brokerUrl,
    username: configHelper.username,
    password: configHelper.password,
    enableRetry: true,
    enableLogging: true,
    certificateConfig: {
      caCertName: "ca-mosquitto.pem",
      rejectUnauthorized: true,
    },
    ...config,
  };

  try {
    return await createTypedMqttDataSourceWithCerts<T>(defaultConfig);
  } catch (error) {
    Logger.warn(
      "SecureMqttInstance",
      "Failed to create secure instance, falling back to insecure:",
      error
    );
    const fallbackConfig = { ...defaultConfig };
    return createTypedMqttDataSource<T>({
      ...fallbackConfig,
      rejectUnauthorized: false,
    });
  }
};

// Simplified factory for common use cases
export const createSecureUsageMqttInstance = () =>
  createSecureMqttInstance<MqttUsageResponse>();

export const createSecureDeviceMqttInstance = () =>
  createSecureMqttInstance<DeviceDataPayload>();

// Keep the existing createSecureMqttInstances function but update it
export const createSecureMqttInstances = async () => {
  try {
    const [usageInstance, deviceInstance, generalInstance] = await Promise.all([
      usageMqttDataSource,
      deviceMqttDataSource,
      mqttDataSource,
    ]);

    return {
      usageMqttDataSource: usageInstance,
      deviceMqttDataSource: deviceInstance,
      mqttDataSource: generalInstance,
      generalMqttDataSource: generalInstance,
    };
  } catch (error) {
    Logger.error(
      "MqttInstances",
      "Failed to create secure MQTT instances:",
      error
    );
    throw error; // Let the caller handle the fallback
  }
};

// Export a promise that resolves to the instances - this will now use secure by default
export const mqttInstancesPromise = createSecureMqttInstances();

// Helper function to get instances with fallback
export const getMqttInstances = async () => {
  try {
    return await mqttInstancesPromise;
  } catch (error) {
    Logger.warn(
      "MqttInstances",
      "Secure instances failed, creating fallback instances:",
      error
    );
    const configHelper = getMqttConfig();
    // Return insecure fallback instances
    return {
      usageMqttDataSource: createTypedMqttDataSource<MqttUsageResponse>({
        brokerUrl: configHelper.brokerUrl,
        username: configHelper.username,
        password: configHelper.password,
        enableRetry: true,
        enableLogging: true,
        rejectUnauthorized: false,
      }),
      deviceMqttDataSource: createTypedMqttDataSource<DeviceDataPayload>({
        brokerUrl: configHelper.brokerUrl,
        username: configHelper.username,
        password: configHelper.password,
        enableRetry: true,
        enableLogging: true,
        rejectUnauthorized: false,
      }),
      mqttDataSource: createMqttDataSource({
        brokerUrl: configHelper.brokerUrl,
        username: configHelper.username,
        password: configHelper.password,
        enableRetry: true,
        enableLogging: true,
        rejectUnauthorized: false,
      }),
      generalMqttDataSource: createMqttDataSource({
        brokerUrl: configHelper.brokerUrl,
        username: configHelper.username,
        password: configHelper.password,
        enableRetry: true,
        enableLogging: true,
        rejectUnauthorized: false,
      }),
    };
  }
};
