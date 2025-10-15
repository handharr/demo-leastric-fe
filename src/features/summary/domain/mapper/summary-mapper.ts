import { DeviceCurrentMqttLogModel } from "@/features/summary/domain/entities/summary-models";
import { optionalValue } from "@/core/utils/wrappers/optional-wrapper";
import { DeviceCurrentMqttLogResponse } from "@/features/summary/infrastructure/models/summary-responses";
import { parseDeviceType } from "@/shared/utils/helpers/enum-helpers";

export const mapDeviceCurrentMqttLogResponseToModel = (
  response: DeviceCurrentMqttLogResponse
): DeviceCurrentMqttLogModel => {
  return {
    deviceId: optionalValue(response.deviceId).orEmpty(),
    deviceName: optionalValue(response.deviceName).orEmpty(),
    deviceType: parseDeviceType(optionalValue(response.deviceType).orEmpty()),
    location: optionalValue(response.location).orEmpty(),
    subLocation: optionalValue(response.subLocation).orNull(),
    detailLocation: optionalValue(response.detailLocation).orNull(),
    lastReading: optionalValue(response.lastReading).orEmpty(),
    totalKwh: optionalValue(response.totalKwh).orZero(),
    latestReadingData: {
      voltage: optionalValue(response.latestReadingData?.voltage).orZero(),
      current: optionalValue(response.latestReadingData?.current).orZero(),
      activePower: optionalValue(
        response.latestReadingData?.activePower
      ).orZero(),
      apparentPower: optionalValue(
        response.latestReadingData?.apparentPower
      ).orZero(),
      powerFactor: optionalValue(
        response.latestReadingData?.powerFactor
      ).orZero(),
      totalKwh: optionalValue(response.latestReadingData?.totalKwh).orZero(),
      currentKwh: optionalValue(
        response.latestReadingData?.currentKwh
      ).orZero(),
      voltageData: {
        vR: optionalValue(response.latestReadingData?.voltageData?.vR).orZero(),
        vS: optionalValue(response.latestReadingData?.voltageData?.vS).orZero(),
        vT: optionalValue(response.latestReadingData?.voltageData?.vT).orZero(),
        vRS: optionalValue(
          response.latestReadingData?.voltageData?.vRS
        ).orZero(),
        vST: optionalValue(
          response.latestReadingData?.voltageData?.vST
        ).orZero(),
        vRT: optionalValue(
          response.latestReadingData?.voltageData?.vRT
        ).orZero(),
      },
      currentData: {
        iR: optionalValue(response.latestReadingData?.currentData?.iR).orZero(),
        iS: optionalValue(response.latestReadingData?.currentData?.iS).orZero(),
        iT: optionalValue(response.latestReadingData?.currentData?.iT).orZero(),
      },
      activePowerData: {
        pR: optionalValue(
          response.latestReadingData?.activePowerData?.pR
        ).orZero(),
        pS: optionalValue(
          response.latestReadingData?.activePowerData?.pS
        ).orZero(),
        pT: optionalValue(
          response.latestReadingData?.activePowerData?.pT
        ).orZero(),
      },
      apparentPowerData: {
        sR: optionalValue(
          response.latestReadingData?.apparentPowerData?.sR
        ).orZero(),
        sS: optionalValue(
          response.latestReadingData?.apparentPowerData?.sS
        ).orZero(),
        sT: optionalValue(
          response.latestReadingData?.apparentPowerData?.sT
        ).orZero(),
      },
      reactivePowerData: {
        qR: optionalValue(
          response.latestReadingData?.reactivePowerData?.qR
        ).orZero(),
        qS: optionalValue(
          response.latestReadingData?.reactivePowerData?.qS
        ).orZero(),
        qT: optionalValue(
          response.latestReadingData?.reactivePowerData?.qT
        ).orZero(),
      },
      powerFactorData: {
        pfR: optionalValue(
          response.latestReadingData?.powerFactorData?.pfR
        ).orZero(),
        pfS: optionalValue(
          response.latestReadingData?.powerFactorData?.pfS
        ).orZero(),
        pfT: optionalValue(
          response.latestReadingData?.powerFactorData?.pfT
        ).orZero(),
      },
      totalEnergyData: {
        tkWhR: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkWhR
        ).orZero(),
        tkWhS: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkWhS
        ).orZero(),
        tkWhT: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkWhT
        ).orZero(),
        tkVAhR: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVAhR
        ).orZero(),
        tkVAhS: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVAhS
        ).orZero(),
        tkVAhT: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVAhT
        ).orZero(),
        tkVArhR: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVArhR
        ).orZero(),
        tkVArhS: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVArhS
        ).orZero(),
        tkVArhT: optionalValue(
          response.latestReadingData?.totalEnergyData?.tkVArhT
        ).orZero(),
      },
      currentKwhData: {
        curkWhR: optionalValue(
          response.latestReadingData?.currentKwhData?.curkWhR
        ).orZero(),
        curkWhS: optionalValue(
          response.latestReadingData?.currentKwhData?.curkWhS
        ).orZero(),
        curkWhT: optionalValue(
          response.latestReadingData?.currentKwhData?.curkWhT
        ).orZero(),
      },
    },
  };
};

export const mapDeviceCurrentMqttLogResponsesToModel = (
  responses: DeviceCurrentMqttLogResponse[]
): DeviceCurrentMqttLogModel[] => {
  return responses.map(mapDeviceCurrentMqttLogResponseToModel);
};
