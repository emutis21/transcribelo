import { SpeechClient, protos } from '@google-cloud/speech'
import cors from 'cors'
import express from 'express'
import multer from 'multer'
import crypto from 'node:crypto'
import fs, { readFileSync } from 'node:fs'
import path from 'node:path'
import config from './src/config'

const app = express()
const port = process.env.PORT ?? 3000
app.use(cors())

const uploadDir = path.join(__dirname, 'uploads')

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

const upload = multer({ storage })

const client = new SpeechClient({
  projectId: config.projectId,
  credentials: {
    private_key: config.privateKey,
    client_email: config.clientEmail,
  },
})

let userData: Array<Record<string, string>> = []

app.post('/api/files', upload.single('file'), async (req, res) => {
  const { file } = req

  if (!file) {
    return res.status(400).send({ message: 'No se ha cargado ningún archivo' })
  }

  if (file.mimetype !== 'audio/mpeg') {
    return res.status(400).send({ message: 'El archivo debe ser de tipo MP3' })
  }

  const audioBytes = readFileSync(file.path).toString('base64')

  const audio = {
    content: audioBytes,
  }

  const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
    encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
    sampleRateHertz: 16000,
    languageCode: 'es-ES',
    enableSpeakerDiarization: true,
    diarizationSpeakerCount: 2,
  } as protos.google.cloud.speech.v1.IRecognitionConfig

  const request = {
    audio: audio,
    config: config,
  }

  let json: Array<Record<string, string>> = []
  try {
    const response = await client.recognize(request)
    const [result] = response

    if (!result.results) return res.status(500).send({ message: 'Error al procesar el archivo' })

    const transcription = result.results
      .filter((result) => result.alternatives && result.alternatives.length > 0)
      .map((result) => result.alternatives![0].transcript)
      .join('\n')

    json = [{ transcription }]
    console.log(json)
  } catch (error) {
    console.error(error)
    return res.status(500).send({ message: 'Error al procesar el archivo' })
  }

  userData = json

  return res.status(200).send({ data: json, message: 'El archivo cargó correctamente' })
})

app.get('/api/transcription', async (req, res) => {
  if (userData.length === 0) {
    return res.status(404).send({ message: 'No hay transcripciones disponibles' })
  }

  res.status(200).send({ data: userData })
})

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
})
