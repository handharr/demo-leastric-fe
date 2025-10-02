import {
  BaseErrorModel,
  createErrorModel,
  mapErrorResponseToModel,
} from "@/shared/domain/entities/base-error-model";
import { optionalValue } from "@/shared/utils/wrappers/optional-wrapper";
import { isErrorResponse } from "@/shared/infrastructure/models/base-error-response";
import { ErrorType } from "@/shared/domain/enum/base-enum";
import { GetMqttLogsQueryParams } from "@/features/admin-management/domain/params/admin-management-query-params";

import { AdminManagementRepository } from "@/features/admin-management/domain/repository/admin-management-repository";
import { AdminManagementDataSource } from "@/features/admin-management/infrastructure/data-source/interface/admin-management-data-source";
import {
  GetMqttLogsModel,
  MqttLogModel,
} from "@/features/admin-management/domain/entity/admin-management-model";
import { RemoteAdminManagementDataSource } from "@/features/admin-management/infrastructure/data-source/remote/remote-admin-management-data-source";

export class AdminManagementRepositoryImpl
  implements AdminManagementRepository
{
  private dataSource: AdminManagementDataSource;

  constructor(
    dataSource: AdminManagementDataSource = new RemoteAdminManagementDataSource()
  ) {
    this.dataSource = dataSource;
  }

  async getMqttLogs({
    queryParam,
  }: {
    queryParam?: GetMqttLogsQueryParams;
  }): Promise<GetMqttLogsModel | BaseErrorModel> {
    const response = await this.dataSource.getMqttLogs({
      params: { ...queryParam },
    });

    if (isErrorResponse(response)) {
      return mapErrorResponseToModel({ response });
    }

    if (!response.data) {
      return createErrorModel({
        message: "No data available",
        type: ErrorType.UNEXPECTED,
      });
    }

    const logs: MqttLogModel[] = optionalValue(response.data.logs)
      .orEmptyArray()
      .map((log) => ({
        dateTime: optionalValue(log.dateTime).orEmpty(),
        topic: optionalValue(log.topic).orEmpty(),
        payload: optionalValue(log.payload).orEmpty(),
      }));

    return {
      logs,
      pagination: {
        page: optionalValue(response.meta?.page).orZero(),
        itemCount: optionalValue(response.meta?.itemCount).orDefault(0),
        pageCount: optionalValue(response.meta?.pageCount).orDefault(1),
        hasPreviousPage: optionalValue(
          response.meta?.hasPreviousPage
        ).orDefault(false),
        hasNextPage: optionalValue(response.meta?.hasNextPage).orDefault(false),
        size: optionalValue(response.meta?.size).orZero(),
      },
    };
  }
}
