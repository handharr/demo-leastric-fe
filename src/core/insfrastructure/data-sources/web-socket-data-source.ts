import { Logger } from "@/core/utils/logger/logger";
import { RetryHandler, RetryOptions } from "@/core/utils/helpers/retry-helper";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { Observable, Subject, BehaviorSubject } from "rxjs";
import { filter, share } from "rxjs/operators";

export type WebSocketMessage<T = unknown> = {
  type: string;
  payload: T;
  timestamp: Date;
  id?: string;
};

export interface WebSocketDataSourceConfig {
  url: string;
  authToken?: string;
  protocols?: string | string[];
  enableRetry?: boolean;
  retryOptions?: RetryOptions;
  connectTimeout?: number;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
  heartbeatMessage?: string | object;
  onConnectionLost?: () => void;
  onReconnect?: () => void;
  onHeartbeatFailed?: () => void;
  enableLogging?: boolean;
  enableHeartbeat?: boolean;
  binaryType?: BinaryType;
  authHeader?: string;
  excludeAuthToken?: boolean;
  headers?: Record<string, string>;
}

export class WebSocketDataSource<T = unknown> {
  private socket: WebSocket | null = null;
  private config: Required<
    Omit<
      WebSocketDataSourceConfig,
      "protocols" | "authToken" | "headers" | "excludeAuthToken"
    >
  > & {
    protocols?: string | string[];
    authToken?: string;
    headers?: Record<string, string>;
    excludeAuthToken?: boolean;
  };
  private connectionPromise: Promise<void> | null = null;
  private isConnecting = false;
  private connectionAttempts = 0;
  private heartbeatIntervalId: NodeJS.Timeout | null = null;
  private reconnectTimeoutId: NodeJS.Timeout | null = null;

  // Single subscription callback
  private messageCallback: ((message: WebSocketMessage<T>) => void) | null =
    null;
  private errorCallback: ((error: Error) => void) | null = null;
  private messageFilter: ((message: WebSocketMessage<T>) => boolean) | null =
    null;

  // Observable subjects for reactive support
  private messageSubject = new Subject<WebSocketMessage<T>>();
  private connectionStatusSubject = new BehaviorSubject<{
    connected: boolean;
    connecting: boolean;
    error?: Error;
    readyState?: number;
  }>({ connected: false, connecting: false });

  constructor(config: WebSocketDataSourceConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols,
      enableRetry: optionalValue(config.enableRetry).orTrue(),
      retryOptions: optionalValue(config.retryOptions).orDefault({
        maxRetries: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        backoffFactor: 2,
      }),
      connectTimeout: optionalValue(config.connectTimeout).orDefault(30000),
      reconnectInterval: optionalValue(config.reconnectInterval).orDefault(
        5000
      ),
      maxReconnectAttempts: optionalValue(
        config.maxReconnectAttempts
      ).orDefault(5),
      heartbeatInterval: optionalValue(config.heartbeatInterval).orDefault(
        30000
      ),
      heartbeatMessage: optionalValue(config.heartbeatMessage).orDefault(
        "ping"
      ),
      onConnectionLost: optionalValue(config.onConnectionLost).orDefault(() =>
        this.defaultConnectionLostHandler()
      ),
      onReconnect: optionalValue(config.onReconnect).orDefault(() =>
        this.defaultReconnectHandler()
      ),
      onHeartbeatFailed: optionalValue(config.onHeartbeatFailed).orDefault(() =>
        this.defaultHeartbeatFailedHandler()
      ),
      enableLogging: optionalValue(config.enableLogging).orDefault(false),
      enableHeartbeat: optionalValue(config.enableHeartbeat).orDefault(true),
      binaryType: optionalValue(config.binaryType).orDefault("blob"),
      authToken: config.authToken,
      authHeader: optionalValue(config.authHeader).orDefault("Authorization"),
      excludeAuthToken: optionalValue(config.excludeAuthToken).orDefault(false),
      headers: config.headers,
    };
  }

  /**
   * Set message handler and optionally connect
   */
  subscribe(
    callback: (message: WebSocketMessage<T>) => void,
    options?: {
      errorHandler?: (error: Error) => void;
      messageFilter?: (message: WebSocketMessage<T>) => boolean;
      autoConnect?: boolean;
      connectOptions?: { excludeAuthToken?: boolean };
    }
  ): () => Promise<void> {
    this.messageCallback = callback;
    this.errorCallback = options?.errorHandler || null;
    this.messageFilter = options?.messageFilter || null;

    if (options?.autoConnect !== false) {
      this.connect(options?.connectOptions).catch((error) => {
        this.logError("Failed to connect during subscription:", error);
        this.errorCallback?.(
          error instanceof Error ? error : new Error(String(error))
        );
      });
    }

    // Return unsubscribe function
    return async () => {
      this.messageCallback = null;
      this.errorCallback = null;
      this.messageFilter = null;
      await this.disconnect();
    };
  }

  /**
   * Get messages as Observable
   */
  getMessages$(): Observable<WebSocketMessage<T>> {
    return this.messageSubject.asObservable().pipe(share());
  }

  /**
   * Filter messages by type
   */
  getMessagesByType$(messageType: string): Observable<WebSocketMessage<T>> {
    return this.messageSubject.pipe(
      filter((message) => message.type === messageType),
      share()
    );
  }

  /**
   * Connect to WebSocket with optional auth token exclusion
   */
  async connect(options?: { excludeAuthToken?: boolean }): Promise<void> {
    if (optionalValue(this.connectionPromise).isPresent()) {
      return this.connectionPromise!;
    }

    if (this.isConnecting) {
      this.log("Connection already in progress");
      return;
    }

    // Temporarily override excludeAuthToken if provided
    const originalExcludeAuthToken = this.config.excludeAuthToken;
    if (options?.excludeAuthToken !== undefined) {
      this.config.excludeAuthToken = options.excludeAuthToken;
    }

    this.log("WebSocketDataSource - connecting with config:", this.config);
    this.connectionPromise = this.config.enableRetry
      ? this.connectWithRetry()
      : this.performConnection();

    try {
      await this.connectionPromise;
    } finally {
      // Restore original excludeAuthToken setting
      this.config.excludeAuthToken = originalExcludeAuthToken;
    }
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
          return this.connectionAttempts < this.config.maxReconnectAttempts;
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
   * Perform actual WebSocket connection
   */
  private async performConnection(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.isConnecting = true;
        this.connectionAttempts++;

        this.log("Connecting to WebSocket:", this.config.url);

        // Clear any existing connection
        this.cleanup();

        // Create WebSocket URL with auth token if provided
        const wsUrl = this.buildWebSocketUrl();

        // Create WebSocket connection
        this.socket = new WebSocket(wsUrl, this.config.protocols);
        this.socket.binaryType = this.config.binaryType;

        // Set connection timeout
        const timeoutId = setTimeout(() => {
          if (this.socket?.readyState === WebSocket.CONNECTING) {
            this.socket.close();
            reject(new Error("WebSocket connection timeout"));
          }
        }, this.config.connectTimeout);

        this.setupEventHandlers(resolve, reject, timeoutId);
      } catch (error) {
        this.isConnecting = false;
        this.logError("Failed to create WebSocket connection:", error);
        reject(error);
      }
    });
  }

  /**
   * Build WebSocket URL with authentication (respecting excludeAuthToken)
   */
  private buildWebSocketUrl(): string {
    let url = this.config.url;

    // Add auth token to URL if provided, not excluded, and no custom headers
    if (
      this.config.authToken &&
      !this.config.excludeAuthToken &&
      !this.config.headers
    ) {
      const separator = url.includes("?") ? "&" : "?";
      url += `${separator}token=${encodeURIComponent(this.config.authToken)}`;
    }

    return url;
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupEventHandlers(
    resolve: () => void,
    reject: (error: Error) => void,
    timeoutId: NodeJS.Timeout
  ): void {
    if (!this.socket) return;

    const socket = this.socket;

    socket.onopen = () => {
      clearTimeout(timeoutId);
      this.log("Connected to WebSocket");
      this.isConnecting = false;
      this.connectionAttempts = 0;
      this.connectionPromise = null;

      // Update connection status
      this.connectionStatusSubject.next({
        connected: true,
        connecting: false,
        readyState: socket.readyState,
      });

      // Start heartbeat if enabled
      if (this.config.enableHeartbeat) {
        this.startHeartbeat();
      }

      resolve();
    };

    socket.onerror = (event) => {
      clearTimeout(timeoutId);
      this.logError("WebSocket connection error:", event);
      this.isConnecting = false;

      const error = new Error("WebSocket connection failed");

      // Update connection status
      this.connectionStatusSubject.next({
        connected: false,
        connecting: false,
        error,
        readyState: socket.readyState,
      });

      if (this.connectionAttempts === 1) {
        reject(error);
      }
    };

    socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    socket.onclose = (event) => {
      this.log(
        `WebSocket connection closed: code=${event.code}, reason=${event.reason}, wasClean=${event.wasClean}`
      );

      // Update connection status
      this.connectionStatusSubject.next({
        connected: false,
        connecting: false,
        readyState: socket.readyState,
      });

      // Stop heartbeat
      this.stopHeartbeat();

      // Handle reconnection if enabled and not a clean close
      if (this.config.enableRetry && !event.wasClean && event.code !== 1000) {
        this.scheduleReconnect();
      }

      this.config.onConnectionLost?.();
    };
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(data: string | ArrayBuffer | Blob): void {
    try {
      const messageData = this.parseMessage<T>(data);
      const wsMessage: WebSocketMessage<T> = {
        type: messageData.type || "message",
        payload: messageData.payload!,
        timestamp: new Date(),
        id: messageData.id,
      };

      this.log(`Received WebSocket message:`, wsMessage);

      // Emit to message subject
      this.messageSubject.next(wsMessage);

      // Call subscription callback if exists and passes filter
      if (this.messageCallback) {
        try {
          if (!this.messageFilter || this.messageFilter(wsMessage)) {
            this.messageCallback(wsMessage);
          }
        } catch (error) {
          this.logError("Error in message callback:", error);
          if (this.errorCallback) {
            this.errorCallback(
              error instanceof Error ? error : new Error(String(error))
            );
          }
        }
      }
    } catch (error) {
      this.logError("Error handling WebSocket message:", error);
      if (this.errorCallback) {
        this.errorCallback(
          error instanceof Error ? error : new Error(String(error))
        );
      }
    }
  }

  /**
   * Parse incoming message data
   */
  private parseMessage<T = unknown>(
    data: string | ArrayBuffer | Blob
  ): Partial<WebSocketMessage<T>> {
    if (typeof data === "string") {
      try {
        const parsed = JSON.parse(data);
        // If parsed data already has WebSocketMessage structure, return it
        if (parsed && typeof parsed === "object" && "type" in parsed) {
          return parsed as Partial<WebSocketMessage<T>>;
        }
        // Otherwise, wrap it in payload
        return { payload: parsed as T };
      } catch {
        return { payload: data as unknown as T };
      }
    } else if (data instanceof ArrayBuffer) {
      // Handle binary data
      const decoder = new TextDecoder();
      const text = decoder.decode(data);
      try {
        const parsed = JSON.parse(text);
        if (parsed && typeof parsed === "object" && "type" in parsed) {
          return parsed as Partial<WebSocketMessage<T>>;
        }
        return { payload: parsed as T };
      } catch {
        return { payload: text as unknown as T };
      }
    } else if (data instanceof Blob) {
      // Handle Blob data (async handling would be better, but keeping sync for now)
      return { payload: data as unknown as T };
    }

    return { payload: data as unknown as T };
  }

  /**
   * Send message to WebSocket
   */
  async send(
    type: string,
    payload: T,
    options?: {
      id?: string;
      timestamp?: boolean;
    }
  ): Promise<void> {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    const message: WebSocketMessage<T> = {
      type,
      payload,
      timestamp: new Date(),
      ...(options?.id && { id: options.id }),
    };

    const messageString = JSON.stringify(message);
    this.log("Sending WebSocket message:", messageString);
    this.socket.send(messageString);
  }

  /**
   * Send raw data to WebSocket
   */
  async sendRaw(data: string | ArrayBuffer | Blob): Promise<void> {
    await this.connect();

    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket not connected");
    }

    this.log("Sending raw WebSocket data:", data);
    this.socket.send(data);
  }

  /**
   * Start heartbeat mechanism
   */
  private startHeartbeat(): void {
    this.stopHeartbeat(); // Clear any existing heartbeat

    this.heartbeatIntervalId = setInterval(() => {
      if (this.socket?.readyState === WebSocket.OPEN) {
        try {
          const heartbeatData =
            typeof this.config.heartbeatMessage === "string"
              ? this.config.heartbeatMessage
              : JSON.stringify(this.config.heartbeatMessage);

          this.socket.send(heartbeatData);
          this.log("Heartbeat sent");
        } catch (error) {
          this.logError("Failed to send heartbeat:", error);
          this.config.onHeartbeatFailed?.();
        }
      } else {
        this.logError("Cannot send heartbeat - WebSocket not open");
        this.config.onHeartbeatFailed?.();
      }
    }, this.config.heartbeatInterval);
  }

  /**
   * Stop heartbeat mechanism
   */
  private stopHeartbeat(): void {
    if (this.heartbeatIntervalId) {
      clearInterval(this.heartbeatIntervalId);
      this.heartbeatIntervalId = null;
    }
  }

  /**
   * Schedule reconnection attempt
   */
  private scheduleReconnect(): void {
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
    }

    this.reconnectTimeoutId = setTimeout(() => {
      this.log("Attempting to reconnect WebSocket");
      this.config.onReconnect?.();
      this.connect().catch((error) => {
        this.logError("Reconnection failed:", error);
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
        this.log("WebSocket already disconnected");
        resolve();
        return;
      }

      // Set up close handler for clean disconnect
      const onClose = () => {
        this.log("WebSocket disconnected cleanly");
        this.cleanup();
        resolve();
      };

      this.socket.addEventListener("close", onClose, { once: true });

      // Close the connection
      this.socket.close(1000, "Normal closure");

      // Fallback timeout
      setTimeout(() => {
        this.cleanup();
        resolve();
      }, 5000);
    });
  }

  /**
   * Cleanup resources
   */
  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }

    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onclose = null;
      this.socket.onerror = null;
      this.socket.onmessage = null;
    }

    this.connectionStatusSubject.next({
      connected: false,
      connecting: false,
    });
  }

  /**
   * Check if WebSocket is connected
   */
  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection status
   */
  getConnectionStatus(): {
    connected: boolean;
    connecting: boolean;
    attempts: number;
    readyState?: number;
    hasSubscription: boolean;
  } {
    return {
      connected: this.isConnected(),
      connecting: this.isConnecting,
      attempts: this.connectionAttempts,
      readyState: this.socket?.readyState,
      hasSubscription: this.messageCallback !== null,
    };
  }

  /**
   * Get connection status as Observable
   */
  getConnectionStatus$(): Observable<{
    connected: boolean;
    connecting: boolean;
    error?: Error;
    readyState?: number;
  }> {
    return this.connectionStatusSubject.asObservable();
  }

  /**
   * Set connection handlers
   */
  setConnectionHandlers(handlers: {
    onConnectionLost?: () => void;
    onReconnect?: () => void;
    onHeartbeatFailed?: () => void;
  }): void {
    const connectionLostWrapper = optionalValue(handlers.onConnectionLost);
    const reconnectWrapper = optionalValue(handlers.onReconnect);
    const heartbeatFailedWrapper = optionalValue(handlers.onHeartbeatFailed);

    if (connectionLostWrapper.isPresent()) {
      this.config.onConnectionLost = handlers.onConnectionLost!;
    }
    if (reconnectWrapper.isPresent()) {
      this.config.onReconnect = handlers.onReconnect!;
    }
    if (heartbeatFailedWrapper.isPresent()) {
      this.config.onHeartbeatFailed = handlers.onHeartbeatFailed!;
    }
  }

  /**
   * Default connection lost handler
   */
  private defaultConnectionLostHandler(): void {
    this.log("Connection lost - using default handler");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("websocket:connection-lost", {
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
        new CustomEvent("websocket:reconnect", {
          detail: { timestamp: new Date() },
        })
      );
    }
  }

  /**
   * Default heartbeat failed handler
   */
  private defaultHeartbeatFailedHandler(): void {
    this.log("Heartbeat failed - using default handler");
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("websocket:heartbeat-failed", {
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
      Logger.info("WebSocketDataSource", message, ...args);
    }
  }

  private logError(message: string, ...args: unknown[]): void {
    if (this.config.enableLogging) {
      Logger.error("WebSocketDataSource", message, ...args);
    }
  }

  /**
   * Get WebSocket instance for advanced usage
   */
  get instance(): WebSocket | null {
    return this.socket;
  }
}
