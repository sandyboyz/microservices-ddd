import { init, start } from "./server";
import { initConnection } from "./application";

initConnection()
  .then(() => init())
  .then(() => start());
