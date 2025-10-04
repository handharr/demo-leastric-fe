import mqtt, { MqttClient } from "mqtt";
import { Logger } from "@/shared/utils/logger/logger";
import {
  RetryHandler,
  RetryOptions,
} from "@/shared/utils/helpers/retry-helper";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export interface MqttMessage<T = unknown> {
  topic: string;
  payload: T;
  timestamp: Date;
  qos?: 0 | 1 | 2;
}

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
  maxSubscriptions?: number;
}

export interface MqttSubscription<T = unknown> {
  topic: string;
  callback: (message: MqttMessage<T>) => void;
  errorHandler?: (error: Error) => void;
  qos?: 0 | 1 | 2;
}

export class MqttDataSource<TDefault = unknown> {
  private client: MqttClient | null = null;
  private config: Required<MqttDataSourceConfig>;
  private subscriptions: Map<string, MqttSubscription<TDefault>> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3;
  private messageHandlers: Map<
    string,
    (message: MqttMessage<TDefault>) => void
  > = new Map();

  constructor(config: MqttDataSourceConfig) {
    this.config = {
      brokerUrl: config.brokerUrl,
      clientId: optionalValue(config.clientId).orDefault(
        `webapp_${Date.now()}`
      ),
      username: optionalValue(config.username).orEmpty(),
      password: optionalValue(config.password).orEmpty(),
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
      enableLogging: optionalValue(config.enableLogging).orTrue(),
      maxSubscriptions: optionalValue(config.maxSubscriptions).orDefault(100),
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
    const clientWrapper = optionalValue(this.client);
    if (clientWrapper.isEmpty()) return;

    const client = this.client!;

    client.on("connect", () => {
      this.log("Connected to MQTT broker");
      this.isConnecting = false;
      this.connectionAttempts = 0;
      this.connectionPromise = null;
      this.resubscribeAll();
      resolve();
    });

    client.on("error", (error) => {
      this.logError("MQTT connection error:", error);
      this.isConnecting = false;
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
      this.config.onReconnect();
    });

    client.on("close", () => {
      this.log("MQTT connection closed");
      this.config.onConnectionLost();
    });

    client.on("offline", () => {
      this.log("MQTT client offline");
    });

    client.on("disconnect", () => {
      this.log("MQTT client disconnected");
    });
  }

  /**
   * Handle incoming MQTT messages
   */
  private handleMessage(topic: string, message: Buffer, qos?: 0 | 1 | 2): void {
    try {
      const payload = this.parseMessage<TDefault>(message);
      const mqttMessage: MqttMessage<TDefault> = {
        topic,
        payload,
        timestamp: new Date(),
        qos,
      };

      this.log(`Received message on topic ${topic}:`, payload);

      // Notify all matching subscriptions
      this.subscriptions.forEach((subscription, subscribedTopic) => {
        if (this.topicMatches(topic, subscribedTopic)) {
          try {
            subscription.callback(mqttMessage);
          } catch (error) {
            this.logError(
              `Error in subscription callback for topic ${subscribedTopic}:`,
              error
            );
            const errorHandler = optionalValue(subscription.errorHandler);
            if (errorHandler.isPresent()) {
              subscription.errorHandler!(
                error instanceof Error ? error : new Error(String(error))
              );
            }
          }
        }
      });

      // Notify generic message handlers (for backward compatibility)
      this.messageHandlers.forEach((handler, handlerTopic) => {
        if (this.topicMatches(topic, handlerTopic)) {
          try {
            handler(mqttMessage);
          } catch (error) {
            this.logError(
              `Error in message handler for topic ${handlerTopic}:`,
              error
            );
          }
        }
      });
    } catch (error) {
      this.logError("Error handling MQTT message:", error);
    }
  }

  /**
   * Parse message payload
   */
  private parseMessage<T = TDefault>(message: Buffer): T {
    try {
      const messageString = message.toString();
      const messageWrapper = optionalValue(messageString);

      if (messageWrapper.isNullOrEmpty()) {
        return messageString as T;
      }

      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(messageString) as T;
      } catch {
        return messageString as T;
      }
    } catch {
      return message.toString() as T;
    }
  }

  /**
   * Check if topic matches subscription pattern
   */
  private topicMatches(actualTopic: string, subscribedTopic: string): boolean {
    const actualTopicWrapper = optionalValue(actualTopic);
    const subscribedTopicWrapper = optionalValue(subscribedTopic);

    if (
      actualTopicWrapper.isNullOrEmpty() ||
      subscribedTopicWrapper.isNullOrEmpty()
    ) {
      return false;
    }

    if (subscribedTopic === "*") return true;

    // Handle MQTT wildcards: + (single level), # (multi level)
    const actualParts = actualTopic.split("/");
    const subscribedParts = subscribedTopic.split("/");

    // Handle multi-level wildcard (#)
    if (subscribedParts.includes("#")) {
      const hashIndex = subscribedParts.indexOf("#");
      if (hashIndex !== subscribedParts.length - 1) return false;

      for (let i = 0; i < hashIndex; i++) {
        if (
          subscribedParts[i] !== "+" &&
          subscribedParts[i] !== actualParts[i]
        ) {
          return false;
        }
      }
      return true;
    }

    // Handle single-level wildcard (+)
    const actualPartsWrapper = optionalValue(actualParts);
    const subscribedPartsWrapper = optionalValue(subscribedParts);

    if (
      actualPartsWrapper.arrayLength() !== subscribedPartsWrapper.arrayLength()
    ) {
      return false;
    }

    for (let i = 0; i < subscribedParts.length; i++) {
      if (subscribedParts[i] !== "+" && subscribedParts[i] !== actualParts[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Subscribe to MQTT topic with specific typing that overrides default
   */
  async subscribe<T = TDefault>(
    topic: string,
    callback: (message: MqttMessage<T>) => void,
    options?: {
      qos?: 0 | 1 | 2;
      errorHandler?: (error: Error) => void;
    }
  ): Promise<void> {
    const topicWrapper = optionalValue(topic);
    if (topicWrapper.isNullOrEmpty()) {
      throw new Error("Topic cannot be null or empty");
    }

    await this.connect();

    if (this.subscriptions.size >= this.config.maxSubscriptions) {
      throw new Error(
        `Maximum subscriptions limit (${this.config.maxSubscriptions}) reached`
      );
    }

    const subscription: MqttSubscription<T> = {
      topic,
      callback: callback as (message: MqttMessage<TDefault>) => void,
      errorHandler: optionalValue(options?.errorHandler).orNull(),
      qos: optionalValue(options?.qos).orDefault(this.config.qos),
    };

    this.subscriptions.set(topic, subscription as MqttSubscription<TDefault>);

    const clientWrapper = optionalValue(this.client);
    if (clientWrapper.isPresent() && this.client!.connected) {
      await this.performSubscription(topic, subscription.qos!);
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
   * Unsubscribe from MQTT topic
   */
  async unsubscribe(topic: string): Promise<void> {
    const topicWrapper = optionalValue(topic);
    if (topicWrapper.isNullOrEmpty()) {
      return;
    }

    this.subscriptions.delete(topic);

    const clientWrapper = optionalValue(this.client);
    if (clientWrapper.isPresent() && this.client!.connected) {
      return new Promise((resolve, reject) => {
        this.client!.unsubscribe(topic, (error) => {
          const errorWrapper = optionalValue(error);
          if (errorWrapper.isPresent()) {
            this.logError(`Failed to unsubscribe from topic ${topic}:`, error);
            reject(error);
          } else {
            this.log(`Unsubscribed from topic: ${topic}`);
            resolve();
          }
        });
      });
    }
  }

  /**
   * Publish message to MQTT topic
   */
  async publish<T = TDefault>(
    topic: string,
    message: T,
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
    const qos = optionalValue(options?.qos).orDefault(this.config.qos);
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
    this.log("Resubscribing to all topics");
    for (const [topic, subscription] of this.subscriptions) {
      try {
        const qos = optionalValue(subscription.qos).orDefault(this.config.qos);
        await this.performSubscription(topic, qos);
      } catch (error) {
        this.logError(`Failed to resubscribe to topic ${topic}:`, error);
        const errorHandler = optionalValue(subscription.errorHandler);
        if (errorHandler.isPresent()) {
          subscription.errorHandler!(
            error instanceof Error ? error : new Error(String(error))
          );
        }
      }
    }
  }

  /**
   * Add message handler (for backward compatibility)
   */
  addMessageHandler<T = TDefault>(
    topicPattern: string,
    handler: (message: MqttMessage<T>) => void
  ): void {
    const topicWrapper = optionalValue(topicPattern);
    if (topicWrapper.isNotNullOrEmpty()) {
      this.messageHandlers.set(
        topicPattern,
        handler as (message: MqttMessage<TDefault>) => void
      );
    }
  }

  /**
   * Remove message handler (for backward compatibility)
   */
  removeMessageHandler(topicPattern: string): void {
    const topicWrapper = optionalValue(topicPattern);
    if (topicWrapper.isNotNullOrEmpty()) {
      this.messageHandlers.delete(topicPattern);
    }
  }

  /**
   * Disconnect from MQTT broker
   */
  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      const clientWrapper = optionalValue(this.client);
      if (clientWrapper.isPresent()) {
        this.client!.end(false, {}, () => {
          this.log("MQTT client disconnected");
          this.connectionPromise = null;
          this.isConnecting = false;
          this.connectionAttempts = 0;
          resolve();
        });
      } else {
        resolve();
      }
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
    subscriptions: number;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      attempts: this.connectionAttempts,
      subscriptions: this.subscriptions.size,
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
export function createMqttDataSource<T = unknown>(
  config: MqttDataSourceConfig
): MqttDataSource<T> {
  return new MqttDataSource<T>(config);
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
export const mqttDataSource = createMqttDataSource<DeviceDataPayload>({
  brokerUrl: optionalValue(process.env.NEXT_PUBLIC_MQTT_BROKER_URL).orDefault(
    "ws://localhost:9001"
  ),
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
  enableRetry: true,
  enableLogging: true,
});

// For general purpose (if needed)
export const generalMqttDataSource = createMqttDataSource<unknown>({
  brokerUrl: optionalValue(process.env.NEXT_PUBLIC_MQTT_BROKER_URL).orDefault(
    "ws://localhost:9001"
  ),
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME,
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD,
  enableRetry: true,
  enableLogging: true,
});
