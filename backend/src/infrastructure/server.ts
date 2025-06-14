import express from "express";
import cors from "cors";
import routes from "./routes";
import { Request, Response, NextFunction } from "express";
import config from "../config";

const app = express();

app.use(
  cors({
    origin: "*",
    credentials: true,
  }),
);

app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ extended: true, limit: "500mb" }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[DEBUG] Original: ${req.url}`);

  if (req.url.startsWith("/default")) {
    req.url = req.url.replace("/default", "");
  }

  if (req.url === "" || req.url === "/") {
    req.url = "/";
  }

  console.log(`[DEBUG] Processed: ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    message: "Speech-to-Text API",
    status: "running",
    timestamp: new Date().toISOString(),
    paths: {
      health: "/api/health",
      upload: "/api/files",
    },
  });
});

app.use("/api", routes);

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    message: config.nodeEnv === "development" ? err.message : "Something went wrong",
  });
});

export { app };

if (config.nodeEnv !== "production") {
  app.listen(3000, () => {
    console.log("🚀 Server running on port 3000");
  });
}
