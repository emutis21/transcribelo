export type Word = {
  start: number
  end: number
  text: string
  confidence: number
  speaker: null | string
}

export type Transcription = {
  words: Word[]
}

export type ApiUploadResponse = {
  message: string
  transcription: Transcription
}
