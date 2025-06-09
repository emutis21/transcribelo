import { ITranscriptionService } from '../../domain/transcriptionService'

const transcribeAudio = (transcriptionService: ITranscriptionService, filePath: string) => {
  return transcriptionService.transcribe(filePath)
}

export default transcribeAudio
