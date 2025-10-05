import mqtt, { MqttClient } from "mqtt";
import { Logger } from "@/shared/utils/logger/logger";

export interface MqttConfig {
  brokerUrl: string;
  clientId?: string;
  username?: string;
  password?: string;
  topics: string[];
}

export class MqttService {
  private client: MqttClient | null = null;
  private config: MqttConfig;
  private messageHandlers: Map<
    string,
    (topic: string, message: Buffer) => void
  > = new Map();

  constructor(config: MqttConfig) {
    this.config = config;
  }

  async connect(): Promise<void> {
    try {
      Logger.info(
        "MqttService",
        "Connecting to MQTT broker:",
        this.config.brokerUrl
      );

      this.client = mqtt.connect(this.config.brokerUrl, {
        clientId: this.config.clientId || `webapp_${Date.now()}`,
        username: this.config.username,
        password: this.config.password,
        reconnectPeriod: 5000,
        connectTimeout: 30000,
      });

      return new Promise((resolve, reject) => {
        this.client!.on("connect", () => {
          Logger.info("MqttService", "Connected to MQTT broker");
          this.subscribeToTopics();
          resolve();
        });

        this.client!.on("error", (error) => {
          Logger.error("MqttService", "MQTT connection error:", error);
          reject(error);
        });

        this.client!.on("message", (topic, message) => {
          this.handleMessage(topic, message);
        });

        this.client!.on("reconnect", () => {
          Logger.info("MqttService", "Reconnecting to MQTT broker");
        });

        this.client!.on("close", () => {
          Logger.info("MqttService", "MQTT connection closed");
        });
      });
    } catch (error) {
      Logger.error("MqttService", "Failed to connect to MQTT broker:", error);
      throw error;
    }
  }

  private subscribeToTopics(): void {
    this.config.topics.forEach((topic) => {
      this.client?.subscribe(topic, (error) => {
        if (error) {
          Logger.error(
            "MqttService",
            `Failed to subscribe to topic ${topic}:`,
            error
          );
        } else {
          Logger.info("MqttService", `Subscribed to topic: ${topic}`);
        }
      });
    });
  }

  private handleMessage(topic: string, message: Buffer): void {
    try {
      const messageString = message.toString();
      Logger.info(
        "MqttService",
        `Received message on topic ${topic}:`,
        messageString
      );

      // Call registered handlers
      this.messageHandlers.forEach((handler, handlerTopic) => {
        if (topic.includes(handlerTopic) || handlerTopic === "*") {
          handler(topic, message);
        }
      });
    } catch (error) {
      Logger.error("MqttService", "Error handling MQTT message:", error);
    }
  }

  addMessageHandler(
    topicPattern: string,
    handler: (topic: string, message: Buffer) => void
  ): void {
    this.messageHandlers.set(topicPattern, handler);
  }

  removeMessageHandler(topicPattern: string): void {
    this.messageHandlers.delete(topicPattern);
  }

  publish(topic: string, message: string): void {
    if (this.client && this.client.connected) {
      this.client.publish(topic, message);
      Logger.info(
        "MqttService",
        `Published message to topic ${topic}:`,
        message
      );
    } else {
      Logger.warn("MqttService", "Cannot publish: MQTT client not connected");
    }
  }

  disconnect(): void {
    if (this.client) {
      this.client.end();
      Logger.info("MqttService", "MQTT client disconnected");
    }
  }

  isConnected(): boolean {
    return this.client?.connected || false;
  }
}
