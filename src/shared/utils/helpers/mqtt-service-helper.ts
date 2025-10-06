"use client";

import { Logger } from "@/shared/utils/logger/logger";
import fs from "fs";
import path from "path";

// Load certificate from public folder (works in both client and server)
export const loadCertificate = async (
  certName: string
): Promise<Buffer | undefined> => {
  try {
    const certUrl = `/certs/${certName}`;
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

// Synchronous version for server-side (fallback to file system)
export const loadCertificateSync = (certName: string): Buffer | undefined => {
  // Check if we're on the server side
  if (typeof window !== "undefined") {
    Logger.warn(
      "CertLoader",
      "Sync certificate loading is only available on server-side"
    );
    return undefined;
  }

  try {
    // Try public folder first
    let certPath = path.join(process.cwd(), "public", "certs", certName);
    if (fs.existsSync(certPath)) {
      return fs.readFileSync(certPath);
    }

    // Fallback to root certs folder
    certPath = path.join(process.cwd(), "certs", certName);
    if (fs.existsSync(certPath)) {
      return fs.readFileSync(certPath);
    }

    Logger.warn("CertLoader", `Certificate file not found: ${certName}`);
    return undefined;
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
