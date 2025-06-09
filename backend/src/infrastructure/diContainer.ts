import { type ITranscriptionService } from '../domain/transcriptionService'
import AssemblyTranscriptionService, {
  type IAssemblyTranscriptionService,
} from '../domain/assemblyTranscriptionService'
import TranscriptionService from '../domain/transcriptionService'
import { SpeechClient } from '@google-cloud/speech'
import config from '../config'
// import OpenAI, { ClientOptions } from 'openai'
// import WhisperTranscriptionService from '../domain/whisperTranscriptionService'

type TranscriptionServiceType = 'google' | 'assembly' | 'openai'

let transcriptionService: IAssemblyTranscriptionService | ITranscriptionService

const speechClient = new SpeechClient({
  projectId: config.projectId,
  credentials: {
    private_key: config.privateKey,
    client_email: config.clientEmail,
  },
})

// const openaiOptions: ClientOptions = {
//   apiKey: config.openAIKey!,
// }

// const openai = new OpenAI(openaiOptions)

const googleTranscriptionService = new TranscriptionService(speechClient)
const assemblyTranscriptionService = new AssemblyTranscriptionService(config.assemblyAIKey!)
// const openaiTranscriptionService = new WhisperTranscriptionService({ openai })

const setTranscriptionService = (service: TranscriptionServiceType) => {
  if (service === 'google') {
    transcriptionService = googleTranscriptionService

    return
  }

  if (service === 'assembly') {
    transcriptionService = assemblyTranscriptionService

    return
  }

  // if (service === 'openai') {
  //   transcriptionService = openaiTranscriptionService

  //   return
  // }
  console.log(service)

  throw new Error(`Unknown transcription service: ${service}`)
}

setTranscriptionService('assembly')

export default {
  get transcriptionService() {
    return transcriptionService
  },
  setTranscriptionService,
}
