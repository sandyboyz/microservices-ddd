import { Server } from "@hapi/hapi";
import { transactionsUseCase } from "./application";
import {
  CreateAdjustmentTransactionErrors,
  CreateAdjustmentTransactionRequestDTO,
} from "./core/use-cases/CreateAdjustmentTransactionUseCase";
import { DeleteAdjustmentTransactionBySKUErrors } from "./core/use-cases/DeleteAdjustmentTransactionBySKUUseCase";
import { DeleteAdjustmentTransactionErrors } from "./core/use-cases/DeleteAdjustmentTransactionUseCase";
import { RetrieveAdjustmentTransactionByIdErrors } from "./core/use-cases/RetrieveAdjustmentTransactionByIdUseCase";
import {
  UpdateAdjustmentTransactionErrors,
  UpdateAdjustmentTransactionRequestDTO,
} from "./core/use-cases/UpdateAdjustmentTransactionUseCase";

export function initController(server: Server) {
  server.route({
    method: "GET",
    path: "/transactions",
    handler: async (request, h) => {
      if (!request.query?.page) {
        request.query.page = 1;
      }

      const result =
        await transactionsUseCase.retrieveAdjustmentTransactionList.execute({
          page: request.query.page,
        });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "GET",
    path: "/transactions/{id}",
    handler: async (request, h) => {
      const result =
        await transactionsUseCase.retrieveAdjustmentTransactionByIdUseCase.execute(
          {
            id: request.params.id,
          }
        );

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case RetrieveAdjustmentTransactionByIdErrors.AdjustmentTransactionNotFound:
            return h.response(error.error).code(404);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "GET",
    path: "/transactions/sku/{sku}",
    handler: async (request, h) => {
      const result =
        await transactionsUseCase.retrieveAdjustmentTransactionBySKUUseCase.execute(
          {
            sku: request.params.sku,
          }
        );

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case RetrieveAdjustmentTransactionByIdErrors.AdjustmentTransactionNotFound:
            return h.response(error.error).code(404);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "POST",
    path: "/transactions",
    handler: async (request, h) => {
      const dto = request.payload as CreateAdjustmentTransactionRequestDTO;
      const result =
        await transactionsUseCase.createAdjustmentTransaction.execute(dto);

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case CreateAdjustmentTransactionErrors.StockNotAvailable:
            return h.response(error.error).code(400);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "PUT",
    path: "/transactions/{id}",
    handler: async (request, h) => {
      const dto = request.payload as Omit<
        UpdateAdjustmentTransactionRequestDTO,
        "id"
      >;

      const result =
        await transactionsUseCase.updateAdjustmentTransaction.execute({
          id: request.params.id,
          ...dto,
        });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case UpdateAdjustmentTransactionErrors.SkuAlreadyExists:
            return h.response(error.error).code(409);
          case UpdateAdjustmentTransactionErrors.AdjustmentTransactionNotFound:
            return h.response(error.error).code(404);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "DELETE",
    path: "/transactions/{id}",
    handler: async (request, h) => {
      const result =
        await transactionsUseCase.deleteAdjustmentTransaction.execute({
          id: request.params.id,
        });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case DeleteAdjustmentTransactionErrors.AdjustmentTransactionNotFound:
            return h.response(error.error).code(404);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "DELETE",
    path: "/transactions/sku/{sku}",
    handler: async (request, h) => {
      const result =
        await transactionsUseCase.deleteAdjustmentTransactionBySKU.execute({
          sku: request.params.sku,
        });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case DeleteAdjustmentTransactionBySKUErrors.AdjustmentTransactionNotFound:
            return h.response(error.error).code(404);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });
}
