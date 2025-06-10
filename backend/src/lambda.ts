import serverlessExpress from "@vendia/serverless-express";
import express from "express";
import cors from "cors";
import routes from "./infrastructure/routes";
import { Request, Response } from "express";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use("/api", routes);

app.get("/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'production',
    services: {
      assemblyAI: !!process.env.ASSEMBLY_AI_KEY,
      googleCloud: !!process.env.PROJECT_ID,
      openAI: !!process.env.OPENAI_KEY
    }
  });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error('Lambda Error:', err);
  res.status(500).json({ 
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export const handler = serverlessExpress({ app });
