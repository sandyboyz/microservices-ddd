"use strict";

import Hapi from "@hapi/hapi";
import { Server } from "@hapi/hapi";
import { initController } from "./controller";

export let server: Server;

export const init = async function (): Promise<Server> {
  server = Hapi.server({
    port: process.env.PORT || 4000,
    host: "0.0.0.0",
  });

  // Routes will go here

  return server;
};

export const start = async function (): Promise<void> {
  console.log(`Listening one ${server.settings.host}:${server.settings.port}`);

  initController(server);

  return server.start();
};

process.on("unhandledRejection", (err) => {
  console.error("unhandledRejection");
  console.error(err);
  process.exit(1);
});
