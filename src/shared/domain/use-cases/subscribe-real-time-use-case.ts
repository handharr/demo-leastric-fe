import { Observable } from "rxjs";
import { BaseErrorModel } from "@/shared/domain/entities/base-error-model";
import {
  MqttUsageAggregatedModel,
  MqttUsageModel,
} from "@/shared/domain/entities/shared-models";
import { SummaryRepository } from "@/features/summary/domain/repositories/summary-repository";
import { Logger } from "@/shared/utils/logger/logger";
import { SummaryRepositoryImpl } from "@/features/summary/infrastructure/repositories-implementation/summary-repository-impl";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";

export class SubscribeRealTimeUsageUseCase {
  constructor(
    private summaryRepository: SummaryRepository = new SummaryRepositoryImpl()
  ) {}

  execute(): Observable<MqttUsageAggregatedModel | BaseErrorModel> {
    Logger.info(
      "SubscribeRealTimeUsageUseCase",
      "execute - starting real-time usage subscription"
    );

    // map the MqttUsageModel to MqttUsageAggregatedModel
    return new Observable<MqttUsageAggregatedModel | BaseErrorModel>(
      (subscriber) => {
        const observable = this.summaryRepository.subscribeRealTimeUsage();
        const subscription = observable.subscribe({
          next: (result) => {
            // It's MqttUsageModel
            const _result = result as MqttUsageModel;
            if ("deviceId" in _result && _result) {
              const phase1Watt = optionalValue(_result["1phases"])
                .orEmptyArray()
                .reduce(
                  (sum, phase) => sum + optionalValue(phase.p).orZero(),
                  0
                );
              const phase3Watt = optionalValue(_result["3phases"])
                .orEmptyArray()
                .reduce(
                  (sum, phase) =>
                    sum +
                    optionalValue(phase.pR).orZero() +
                    optionalValue(phase.pS).orZero() +
                    optionalValue(phase.pT).orZero(),
                  0
                );
              const aggregated: MqttUsageAggregatedModel = {
                deviceId: optionalValue(
                  _result["1phases"]?.[0]?.devid ||
                    _result["3phases"]?.[0]?.devid
                ).orEmpty(),
                totalWatt: phase1Watt + phase3Watt,
              };
              subscriber.next(aggregated);
            } else {
              // It's BaseErrorModel
              subscriber.next(result as BaseErrorModel);
            }
          },
          error: (err) => {
            Logger.error(
              "SubscribeRealTimeUsageUseCase",
              `execute - subscription error: ${err.message}`
            );
            subscriber.error({
              type: "Network",
              message: err.message || "Network error",
            });
          },
          complete: () => {
            Logger.info(
              "SubscribeRealTimeUsageUseCase",
              "execute - subscription completed"
            );
            subscriber.complete();
          },
        });

        // Cleanup function
        return () => {
          Logger.info(
            "SubscribeRealTimeUsageUseCase",
            "execute - unsubscribing from real-time usage"
          );
          subscription.unsubscribe();
        };
      }
    );
  }
}
