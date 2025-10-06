"use client";

import { Logger } from "@/shared/utils/logger/logger";

export const getMqttConfig = () => ({
  brokerUrl:
    process.env.NEXT_PUBLIC_MQTT_BROKER_URL ||
    "mqtts://staging-api.leastric.com:8883",
  username: process.env.NEXT_PUBLIC_MQTT_USERNAME || "admin",
  password: process.env.NEXT_PUBLIC_MQTT_PASSWORD || "admin123",
});

// Load certificate from public folder (works in both client and server)
export const loadCertificate = async (
  certName: string
): Promise<Buffer | undefined> => {
  try {
    // Get the base URL for the current environment
    const baseUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

    const certUrl = `${baseUrl}/certs/${certName}`;
    const response = await fetch(certUrl);

    if (!response.ok) {
      Logger.warn("CertLoader", `Certificate file not found: ${certUrl}`);
      return undefined;
    }

    const certText = await response.text();
    const certBuffer = Buffer.from(certText, "utf8");

    Logger.info("CertLoader", `Successfully loaded certificate: ${certName}`);
    return certBuffer;
  } catch (error) {
    Logger.error(
      "CertLoader",
      `Failed to load certificate ${certName}:`,
      error
    );
    return undefined;
  }
};

// Helper to check if we can load certificates
export const canLoadCertificates = (): boolean => {
  return true; // Always true since we can fetch from public folder
};

// New: MQTT-specific certificate configuration helper
export const createMqttCertConfig = async (options: {
  caCertName?: string;
  clientCertName?: string;
  clientKeyName?: string;
  rejectUnauthorized?: boolean;
}): Promise<{
  ca?: Buffer;
  cert?: Buffer;
  key?: Buffer;
  rejectUnauthorized: boolean;
}> => {
  const config: {
    ca?: Buffer;
    cert?: Buffer;
    key?: Buffer;
    rejectUnauthorized: boolean;
  } = {
    rejectUnauthorized: options.rejectUnauthorized ?? true,
  };

  try {
    // Load CA certificate if specified
    if (options.caCertName) {
      const caCert = await loadCertificate(options.caCertName);
      if (caCert) {
        config.ca = caCert;
        Logger.info(
          "MqttCertConfig",
          `Loaded CA certificate: ${options.caCertName}`
        );
      }
    }

    // Load client certificate if specified
    if (options.clientCertName) {
      const clientCert = await loadCertificate(options.clientCertName);
      if (clientCert) {
        config.cert = clientCert;
        Logger.info(
          "MqttCertConfig",
          `Loaded client certificate: ${options.clientCertName}`
        );
      }
    }

    // Load client key if specified
    if (options.clientKeyName) {
      const clientKey = await loadCertificate(options.clientKeyName);
      if (clientKey) {
        config.key = clientKey;
        Logger.info(
          "MqttCertConfig",
          `Loaded client key: ${options.clientKeyName}`
        );
      }
    }

    return config;
  } catch (error) {
    Logger.error("MqttCertConfig", "Failed to create MQTT cert config:", error);
    return { rejectUnauthorized: false }; // Fallback to insecure
  }
};
