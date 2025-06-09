import serverlessExpress from "@vendia/serverless-express";
import express from "express";
import cors from "cors";
import routes from "./infrastructure/routes";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://tu-app.vercel.app",
    credentials: true,
  }),
);

app.use(express.json());
app.use("/api", routes);


app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export const handler = serverlessExpress({ app });
