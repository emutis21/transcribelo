export interface Transcription {
  id: string;
  text: string;
  message: string;
  createdAt: string;
}

export interface ApiUploadResponse {
  message: string;
  transcription: string;
  transcriptId: string;
}
