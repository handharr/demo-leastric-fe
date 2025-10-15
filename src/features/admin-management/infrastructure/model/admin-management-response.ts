import { MqttUsageResponse } from "@/shared/infrastructure/responses/shared-response";

export interface MqttLogResponse {
  dateTime?: string;
  topic?: string;
  payload?: MqttUsageResponse;
}

export interface GetMqttLogsResponse {
  logs: MqttLogResponse[];
}
