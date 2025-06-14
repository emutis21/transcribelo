import { Router } from "express";
import uploadFileController from "../application/controllers/uploadFileController";
import getTranscriptionController from "../application/controllers/getTranscriptionController";
import config from "../config";

const router = Router();

// Debug middleware para ver qué rutas llegan aquí
router.use((req, res, next) => {
  console.log(`[ROUTES] ${req.method} ${req.url}`);
  next();
});

router.get("/health", (req, res) => {
  console.log("[ROUTES] Health check called");
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

router.post("/files", uploadFileController);
router.get("/transcription", getTranscriptionController);

// router.post('/assembly', {})
// router.get('/assembly', {})

export default router;
