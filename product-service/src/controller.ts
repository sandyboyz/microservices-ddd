import { Server } from "@hapi/hapi";
import { productsUseCase } from "./application";
import {
  CreateProductErrors,
  CreateProductRequestDTO,
  CreateProductUseCase,
} from "./core/use-cases/CreateProductUseCase";
import { DeleteProductErrors } from "./core/use-cases/DeleteProductUseCase";
import { InitialProductErrors } from "./core/use-cases/InitialProductUseCase";
import { RetrieveProductByIdErrors } from "./core/use-cases/RetrieveProductByIdUseCase";
import { RetrieveProductBySKUErrors } from "./core/use-cases/RetrieveProductBySKUUseCase";
import {
  UpdateProductErrors,
  UpdateProductRequestDTO,
} from "./core/use-cases/UpdateProductUseCase";

export function initController(server: Server) {
  server.route({
    method: "GET",
    path: "/products",
    handler: async (request, h) => {
      if (!request.query?.page) {
        request.query.page = 1;
      }

      const result = await productsUseCase.retrieveProductList.execute({
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
    path: "/products/{id}",
    handler: async (request, h) => {
      const result = await productsUseCase.retrieveProductByIdUseCase.execute({
        id: request.params.id,
      });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case RetrieveProductByIdErrors.ProductNotFound:
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
    path: "/products/sku/{sku}",
    handler: async (request, h) => {
      const result = await productsUseCase.retrieveProductBySKUUseCase.execute({
        sku: request.params.sku,
      });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case RetrieveProductBySKUErrors.ProductNotFound:
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
    path: "/products",
    handler: async (request, h) => {
      const dto = request.payload as CreateProductRequestDTO;
      const result = await productsUseCase.createProduct.execute(dto);

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case CreateProductErrors.SkuAlreadyExists:
            return h.response(error.error).code(409);
          default:
            return h.response(error.error).code(500);
        }
      }

      return result.value.getValue();
    },
  });

  server.route({
    method: "PUT",
    path: "/products/{id}",
    handler: async (request, h) => {
      const dto = request.payload as Omit<UpdateProductRequestDTO, "id">;

      const result = await productsUseCase.updateProduct.execute({
        id: request.params.id,
        ...dto,
      });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case UpdateProductErrors.SkuAlreadyExists:
            return h.response(error.error).code(409);
          case UpdateProductErrors.ProductNotFound:
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
    path: "/products/{id}",
    handler: async (request, h) => {
      const result = await productsUseCase.deleteProduct.execute({
        id: request.params.id,
      });

      if (result.isLeft()) {
        const error = result.value;

        switch (error.constructor) {
          case DeleteProductErrors.ProductNotFound:
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
    path: "/products/init",
    handler: async (request, h) => {
      const result = await productsUseCase.initialProduct.execute();

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
}
