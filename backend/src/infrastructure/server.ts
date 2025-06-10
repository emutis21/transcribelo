import express from "express";
import cors from "cors";
import routes from "./routes";
import { Request, Response } from "express";
import config from "../config";

const app = express();
const port = config.nodeEnv === "production" ? 3000 : 3000;

app.use(
  cors({
    origin: config.frontendUrl || config.nodeEnv === "development" ? "*" : config.frontendUrl,
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    services: {
      assemblyAI: !!config.assemblyAIKey,
      googleCloud: !!config.projectId,
      openAI: !!config.openAIKey,
    },
  });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: config.nodeEnv === "development" ? err.message : "Something went wrong",
  });
});

export { app };

if (config.nodeEnv !== "production") {
  app.listen(port, () => {
    console.log(`🚀 Server is running at http://localhost:${port}`);
    console.log(`🌍 CORS origin: ${config.frontendUrl}`);
    console.log(`🔧 Environment: ${config.nodeEnv}`);
  });
}
