import { Request, Response } from "express";
import multer from "multer";
import fs from "node:fs";
import crypto from "node:crypto";

import diContainer from "../../infrastructure/diContainer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
}).single("file");

const uploadFileController = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).send({
        message:
          err.code === "LIMIT_FILE_SIZE" ? "Archivo demasiado grande (máximo 50MB)" : "Error al cargar el archivo",
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

      const transcriptionResult = await diContainer.transcriptionService.transcribe(tempFilePath);

      console.log("Transcription result:", transcriptionResult);

      if ("id" in transcriptionResult && "text" in transcriptionResult) {
        res.status(200).send({
          message: "El archivo se cargó correctamente",
          transcription: transcriptionResult.text,
          transcriptId: transcriptionResult.id,
        });
      } else {
        const googleResult = transcriptionResult as unknown as { transcript?: string; text?: string };
        res.status(200).send({
          message: "El archivo se cargó correctamente",
          transcription: googleResult.transcript || googleResult.text || "No transcription available",
          transcriptId: null,
        });
      }
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
