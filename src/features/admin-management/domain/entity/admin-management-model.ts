import { PaginationModel } from "@/core/domain/entities/base-model";

export interface MqttLog1PhaseModel {
  devid: string;
  v: number;
  i: number;
  p: number;
  s: number;
  pf: number;
  curkWh: number;
  tkWh: number;
}

export interface MqttLog3PhaseModel {
  devid: string;
  vR: number;
  vS: number;
  vT: number;
  vRS: number;
  vST: number;
  vRT: number;
  iR: number;
  iS: number;
  iT: number;
  pR: number;
  pS: number;
  pT: number;
  sR: number;
  sS: number;
  sT: number;
  qR: number;
  qS: number;
  qT: number;
  pfR: number;
  pfS: number;
  pfT: number;
  curkWhR: number;
  curkWhS: number;
  curkWhT: number;
  tkWhR: number;
  tkWhS: number;
  tkWhT: number;
  tkVAhR: number;
  tkVAhS: number;
  tkVAhT: number;
  tkVArhR: number;
  tkVArhS: number;
  tkVArhT: number;
}

export interface MqttLogModel {
  dateTime: string;
  topic: string;
  payload: string;
}

export interface GetMqttLogsModel {
  logs: MqttLogModel[];
  pagination: PaginationModel;
}
