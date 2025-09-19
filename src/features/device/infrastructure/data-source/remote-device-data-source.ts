import { AxiosError } from "axios";
import { BaseResponse } from "@/shared/infrastructure/models/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/shared/infrastructure/api/api-client";
import { BaseErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import {
  CreateDeviceResponse,
  DeleteDeviceResponse,
  GetDeviceResponse,
  GetDevicesResponse,
  GetDevicesStatusResponse,
  UpdateDeviceResponse,
} from "@/features/device/infrastructure/models/device-response";
import { CreateDeviceFormData } from "@/features/device/domain/params/data-params";
import { DeviceDataSource } from "@/features/device/infrastructure/data-source/device-data-source";
import { Logger } from "@/shared/utils/logger/logger";
import { UpdateDeviceDto } from "@/features/device/infrastructure/params/device-dto";

export class RemoteDeviceDataSource implements DeviceDataSource {
  private apiClient: ApiClient;

  constructor(apiClient?: ApiClient, onAuthFailure?: () => void) {
    this.apiClient = apiClient || createAuthApiClient();

    // Set custom auth failure handler if provided
    if (onAuthFailure) {
      this.apiClient.setAuthFailureHandler(onAuthFailure);
    }
  }

  async getDeviceDetails({
    deviceId,
  }: {
    deviceId: number;
  }): Promise<BaseResponse<GetDeviceResponse> | BaseErrorResponse> {
    Logger.info("RemoteDeviceDataSource", "Fetching device details:", deviceId);
    try {
      return await this.apiClient.get<BaseResponse<GetDeviceResponse>>(
        `v1/devices/${deviceId}`
      );
    } catch (error) {
      Logger.error(
        "RemoteDeviceDataSource",
        "Error fetching device details:",
        error
      );
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve device details. Please try again."
      );
    }
  }

  async updateDeviceDetails({
    deviceId,
    deviceData,
  }: {
    deviceId: number;
    deviceData: UpdateDeviceDto;
  }): Promise<BaseResponse<UpdateDeviceResponse> | BaseErrorResponse> {
    try {
      return await this.apiClient.patch<BaseResponse<UpdateDeviceResponse>>(
        `v1/devices/${deviceId}`,
        deviceData
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to update device details. Please try again."
      );
    }
  }

  async deleteDevice({
    deviceId,
  }: {
    deviceId: number;
  }): Promise<BaseResponse<DeleteDeviceResponse> | BaseErrorResponse> {
    try {
      return this.apiClient.delete<BaseResponse<DeleteDeviceResponse>>(
        `v1/devices/${deviceId}`
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to delete device. Please try again."
      );
    }
  }

  async createDevice({
    deviceData,
  }: {
    deviceData: CreateDeviceFormData;
  }): Promise<BaseResponse<CreateDeviceResponse> | BaseErrorResponse> {
    try {
      return await this.apiClient.post<BaseResponse<CreateDeviceResponse>>(
        `v1/devices`,
        deviceData
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to create device. Please try again."
      );
    }
  }

  async getAllDevices({
    params,
  }: {
    params?: Record<string, unknown>;
  }): Promise<BaseResponse<GetDevicesResponse> | BaseErrorResponse> {
    try {
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };
      return await this.apiClient.get<BaseResponse<GetDevicesResponse>>(
        `v1/devices`,
        params,
        { headers }
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve devices. Please try again."
      );
    }
  }

  async getDevicesStatus(): Promise<
    BaseResponse<GetDevicesStatusResponse> | BaseErrorResponse
  > {
    try {
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };
      return await this.apiClient.get<BaseResponse<GetDevicesStatusResponse>>(
        `v1/status/devices`,
        undefined,
        { headers }
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve devices status. Please try again."
      );
    }
  }
}
