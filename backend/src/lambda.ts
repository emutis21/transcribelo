import serverlessExpress from "@vendia/serverless-express";
import { app } from "./infrastructure/server";

export const handler = serverlessExpress({ app });
