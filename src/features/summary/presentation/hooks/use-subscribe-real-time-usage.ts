import { useState, useCallback } from "react";
import {
  BaseErrorModel,
  isErrorModel,
} from "@/shared/domain/entities/base-error-model";
import { Logger } from "@/shared/utils/logger/logger";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { MqttUsageAggregatedModel } from "@/shared/domain/entities/shared-models";
import { Observable, Subscription } from "rxjs";
import { SubscribeRealTimeUsageUseCase } from "@/shared/domain/use-cases/subscribe-real-time-use-case";

interface UseSubscribeRealTimeUsageReturn {
  data: MqttUsageAggregatedModel | null;
  error: BaseErrorModel | null;
  loading: boolean;
  subscribe: () => void;
  unsubscribe: () => void;
}

export const useSubscribeRealTimeUsage =
  (): UseSubscribeRealTimeUsageReturn => {
    const [data, setData] = useState<MqttUsageAggregatedModel | null>(null);
    const [error, setError] = useState<BaseErrorModel | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    const subscribe = useCallback(() => {
      if (subscription) {
        Logger.warn(
          "useSubscribeRealTimeUsage",
          "subscribe - already subscribed"
        );
        return;
      }

      Logger.info("useSubscribeRealTimeUsage", "subscribe - subscribing...");
      setLoading(true);
      setError(null);

      const useCase = new SubscribeRealTimeUsageUseCase();
      const observable: Observable<MqttUsageAggregatedModel | BaseErrorModel> =
        useCase.execute();

      const sub = observable.subscribe({
        next: (result) => {
          if (isErrorModel(result)) {
            Logger.error(
              "useSubscribeRealTimeUsage",
              `subscribe - error received: ${result.message}`
            );
            setError(result);
            setData(null);
          } else {
            Logger.info(
              "useSubscribeRealTimeUsage",
              "subscribe - data received"
            );
            setData(result);
            setError(null);
          }
          setLoading(false);
        },
        error: (err) => {
          Logger.error(
            "useSubscribeRealTimeUsage",
            `subscribe - subscription error: ${err.message}`
          );
          setError({
            type: ErrorType.NETWORK,
            message: err.message || "Network error",
          });
          setData(null);
          setLoading(false);
        },
        complete: () => {
          Logger.info(
            "useSubscribeRealTimeUsage",
            "subscribe - subscription completed"
          );
          setLoading(false);
        },
      });

      setSubscription(sub);
    }, [subscription]);

    const unsubscribe = useCallback(() => {
      if (subscription) {
        Logger.info(
          "useSubscribeRealTimeUsage",
          "unsubscribe - unsubscribing..."
        );
        subscription.unsubscribe();
        setSubscription(null);
        setLoading(false);
      } else {
        Logger.warn(
          "useSubscribeRealTimeUsage",
          "unsubscribe - no active subscription"
        );
      }
    }, [subscription]);

    return {
      data,
      error,
      loading,
      subscribe,
      unsubscribe,
    };
  };
