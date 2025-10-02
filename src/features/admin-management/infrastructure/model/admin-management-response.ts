export interface MqttLog1PhaseResponse {
  devid?: string;
  v?: number;
  i?: number;
  p?: number;
  s?: number;
  pf?: number;
  curkWh?: number;
  tkWh?: number;
}

export interface MqttLog3PhaseResponse {
  devid?: string;
  vR?: number;
  vS?: number;
  vT?: number;
  vRS?: number;
  vST?: number;
  vRT?: number;
  iR?: number;
  iS?: number;
  iT?: number;
  pR?: number;
  pS?: number;
  pT?: number;
  sR?: number;
  sS?: number;
  sT?: number;
  qR?: number;
  qS?: number;
  qT?: number;
  pfR?: number;
  pfS?: number;
  pfT?: number;
  curkWhR?: number;
  curkWhS?: number;
  curkWhT?: number;
  tkWhR?: number;
  tkWhS?: number;
  tkWhT?: number;
  tkVAhR?: number;
  tkVAhS?: number;
  tkVAhT?: number;
  tkVArhR?: number;
  tkVArhS?: number;
  tkVArhT?: number;
}

export interface MqttLogResponse {
  dateTime?: string;
  topic?: string;
  payload?: {
    "1phases"?: MqttLog1PhaseResponse[];
    "3phases"?: MqttLog3PhaseResponse[];
  };
}

export interface GetMqttLogsResponse {
  logs: MqttLogResponse[];
}
