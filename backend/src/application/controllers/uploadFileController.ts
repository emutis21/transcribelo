import { Request, Response } from "express";
import multer from "multer";
import fs from "node:fs";
import crypto from "node:crypto";

import diContainer from "../../infrastructure/diContainer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5000 * 1024 * 1024,
    files: 1,
  },
}).single("file");

const uploadFileController = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).send({
        message:
          err.code === "LIMIT_FILE_SIZE" ? "Archivo demasiado grande (máximo 500MB)" : "Error al cargar el archivo",
      });
    }

    const { file } = req;

    if (!file) {
      return res.status(400).send({ message: "No se ha cargado ningún archivo" });
    }

    let tempFilePath: string | undefined;

    try {
      tempFilePath = `/tmp/${crypto.randomUUID()}-${file.originalname}`;
      fs.writeFileSync(tempFilePath, file.buffer);

      console.log(`Processing file: ${file.originalname} (${file.size} bytes)`);

      const transcriptionJob = await diContainer.transcriptionService.submitTranscription(tempFilePath);

      console.log("Job submitted:", transcriptionJob);

      res.status(200).send({
        message: "El archivo se cargó correctamente",
        transcriptId: transcriptionJob.id,
        status: "processing",
        estimatedTime: "1-2 minutes",
        checkUrl: `/api/transcription?id=${transcriptionJob.id}`,
      });
    } catch (error) {
      console.error("Transcription error:", error);
      res.status(500).send({ message: "Error al procesar el archivo" });
    } finally {
      if (tempFilePath) {
        try {
          if (fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Cleaned up: ${tempFilePath}`);
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
    }
  });
};

export default uploadFileController;
