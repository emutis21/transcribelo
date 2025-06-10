import config from "./config";

if (config.nodeEnv !== "production") {
  require("./infrastructure/server");
}

export { handler } from "./lambda";
