import { MqttUsageResponse } from "@/shared/infrastructure/models/shared-response";

export interface MqttLogResponse {
  dateTime?: string;
  topic?: string;
  payload?: MqttUsageResponse;
}

export interface GetMqttLogsResponse {
  logs: MqttLogResponse[];
}
