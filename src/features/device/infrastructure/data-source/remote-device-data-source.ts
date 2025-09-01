import { AxiosError } from "axios";
import { BaseResponse } from "@/shared/infrastructure/model/base-response";
import {
  ApiClient,
  createAuthApiClient,
} from "@/shared/infrastructure/api/api-client";
import { BaseErrorResponse } from "@/shared/infrastructure/model/base-error-response";
import {
  CreateDeviceResponse,
  DeleteDeviceResponse,
  GetDeviceResponse,
  GetDevicesResponse,
  UpdateDeviceResponse,
} from "@/features/device/infrastructure/model/device-response";
import {
  CreateDeviceFormData,
  UpdateDeviceFormData,
} from "@/features/device/domain/params/data-params";
import { DeviceDataSource } from "@/features/device/infrastructure/data-source/device-data-source";
import { Logger } from "@/shared/utils/logger/logger";

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
    deviceData: UpdateDeviceFormData;
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

  async getAllDevices(): Promise<
    BaseResponse<GetDevicesResponse> | BaseErrorResponse
  > {
    try {
      return await this.apiClient.get<BaseResponse<GetDevicesResponse>>(
        `v1/devices`
      );
    } catch (error) {
      return this.apiClient.handleError(
        error as AxiosError<BaseErrorResponse>,
        "Failed to retrieve devices. Please try again."
      );
    }
  }
}
