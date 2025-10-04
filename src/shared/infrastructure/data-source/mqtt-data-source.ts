import mqtt, { MqttClient } from "mqtt";
import { Logger } from "@/shared/utils/logger/logger";
import {
  RetryHandler,
  RetryOptions,
} from "@/shared/utils/helpers/retry-helper";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { filter, share } from "rxjs/operators";

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
}

export class MqttDataSource {
  private client: MqttClient | null = null;
  private config: MqttDataSourceConfig;
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;

  // Replace single subscription with multiple subscriptions
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
      this.log("Connection already in progress");
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

        this.log("Connecting to MQTT broker:", this.config.brokerUrl);

        this.client = mqtt.connect(this.config.brokerUrl, {
          clientId: this.config.clientId,
          username: optionalValue(this.config.username).isNotNullOrEmpty()
            ? this.config.username
            : undefined,
          password: optionalValue(this.config.password).isNotNullOrEmpty()
            ? this.config.password
            : undefined,
          reconnectPeriod: this.config.reconnectPeriod,
          connectTimeout: this.config.connectTimeout,
          keepalive: this.config.keepAlive,
          clean: true,
          rejectUnauthorized: false,
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
  subscribeToTopic<T>({
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

      const messageCallback = (message: MqttMessage<T>) => {
        if (this.topicMatches(message.topic, topic)) {
          subscriber.next(message);
        }
      };

      const errorHandler = (error: Error) => {
        subscriber.error(error);
      };

      // Store subscription
      this.subscriptions.set(subscriptionKey, {
        callback: messageCallback,
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
   * Filter messages by topic pattern
   */
  getMessagesByTopic$(topicPattern: string): Observable<MqttMessage<unknown>> {
    return this.messageSubject.pipe(
      filter((message) => this.topicMatches(message.topic, topicPattern))
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

// Define specific types for your use case
export interface DeviceDataPayload {
  deviceId: string;
  power: number;
  voltage: number;
  current: number;
  timestamp?: string;
}

// Default instance for device data
export const mqttDataSource = createMqttDataSource({
  brokerUrl: optionalValue(process.env.NEXT_PUBLIC_MQTT_BROKER_URL).orDefault(
    "ws://localhost:9001"
  ),
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
  enableRetry: true,
  enableLogging: true,
});

// For general purpose (if needed)
export const generalMqttDataSource = createMqttDataSource({
  brokerUrl: optionalValue(process.env.NEXT_PUBLIC_MQTT_BROKER_URL).orDefault(
    "ws://localhost:9001"
  ),
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
  enableRetry: true,
  enableLogging: true,
});
