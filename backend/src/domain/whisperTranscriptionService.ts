import { OpenAI } from 'openai'
import fs from 'node:fs'

interface ITranscriptionService {
  transcribe(filePath: string): Promise<string>
}

interface WhisperTranscriptionServiceOptions {
  openai: OpenAI
}

class WhisperTranscriptionService implements ITranscriptionService {
  private openai: OpenAI

  constructor(options: WhisperTranscriptionServiceOptions) {
    this.openai = options.openai
  }

  async transcribe(filePath: string): Promise<string> {
    const transcription = await this.openai.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-1',
      response_format: 'json',
    })

    return 'hola'
  }
}

export default WhisperTranscriptionService
export { ITranscriptionService }
