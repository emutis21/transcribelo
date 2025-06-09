import { SpeechClient, protos } from '@google-cloud/speech'
import fs from 'node:fs'

interface ITranscriptionService {
  transcribe(filePath: string): Promise<protos.google.cloud.speech.v1.IRecognizeResponse>
}

class GoogleTranscriptionService implements ITranscriptionService {
  private client: SpeechClient

  constructor(client: SpeechClient) {
    this.client = client
  }

  async transcribe(filePath: string): Promise<protos.google.cloud.speech.v1.IRecognizeResponse> {
    const file = fs.readFileSync(filePath)
    const audioBytes = file.toString('base64')

    const audio = { content: audioBytes }
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.MP3,
      sampleRateHertz: 16000,
      languageCode: 'es-CO',
      enableSpeakerDiarization: true,
      diarizationSpeakerCount: 2,
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    } as protos.google.cloud.speech.v1.IRecognitionConfig

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = { audio, config }

    const [response] = await this.client.recognize(request)

    console.log(`Transcription: ${JSON.stringify(response)}`)
    return response
  }
}

export default GoogleTranscriptionService
export { ITranscriptionService }
