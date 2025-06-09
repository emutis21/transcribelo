import { Request, Response } from 'express'
import multer from 'multer'
import path from 'node:path'
import fs from 'node:fs'
import crypto from 'node:crypto'

import diContainer from '../../infrastructure/diContainer'

const uploadDir = path.join(__dirname, '../../../uploads')
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir)
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueName = `${crypto.randomUUID()}-${file.originalname}`

    cb(null, uniqueName)
  },
})

const upload = multer({ storage }).single('file')

const uploadFileController = (req: Request, res: Response) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ message: 'Error al cargar el archivo' })
    }

    const { file } = req

    if (!file) {
      return res.status(400).send({ message: 'No se ha cargado ningún archivo' })
    }

    try {
      const transcriptionResult = await diContainer.transcriptionService.transcribe(file.path);

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
      console.error(error);

      res.status(500).send({ message: "Error al procesar el archivo" });
    } finally {
      fs.unlinkSync(file.path);
    }
  })
}

export default uploadFileController
