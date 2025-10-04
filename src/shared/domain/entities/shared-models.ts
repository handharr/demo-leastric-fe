export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface MqttLog1PhaseModel {
  devid: string;
  p: number;
}

export interface MqttLog3PhaseModel {
  devid: string;
  pR: number;
  pS: number;
  pT: number;
}

export interface MqttUsageModel {
  "1phases"?: MqttLog1PhaseModel[];
  "3phases"?: MqttLog3PhaseModel[];
}
