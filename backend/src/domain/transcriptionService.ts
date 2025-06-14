import { SpeechClient, protos } from "@google-cloud/speech";
import fs from "node:fs";

interface ITranscriptionService {
  transcribe(filePath: string): Promise<{ id: string; text: string }>;
  submitTranscription(filePath: string): Promise<{ id: string }>;
  getTranscriptionResult(id: string): Promise<{ id: string; text: string; status: string }>;
}

class GoogleTranscriptionService implements ITranscriptionService {
  private client: SpeechClient;

  constructor(client: SpeechClient) {
    this.client = client;
  }

  async transcribe(filePath: string): Promise<{ id: string; text: string }> {
    const file = fs.readFileSync(filePath);
    const audioBytes = file.toString("base64");

    const audio = { content: audioBytes };
    const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
      encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS,
      sampleRateHertz: 16000,
      languageCode: "es-CO",
      diarizationConfig: {
        enableSpeakerDiarization: true,
        minSpeakerCount: 2,
        maxSpeakerCount: 2,
      },
      enableAutomaticPunctuation: true,
      enableWordTimeOffsets: true,
    };

    const request: protos.google.cloud.speech.v1.IRecognizeRequest = { audio, config };
    const [response] = await this.client.recognize(request);

    console.log(`Transcription: ${JSON.stringify(response)}`);

    const transcript =
      response.results
        ?.map((result) => result.alternatives?.[0]?.transcript)
        .filter(Boolean)
        .join(" ") || "";

    return {
      id: `google-${Date.now()}`,
      text: transcript,
    };
  }

  async submitTranscription(filePath: string): Promise<{ id: string }> {
    try {
      const file = fs.readFileSync(filePath);
      const audioBytes = file.toString("base64");

      const audio = { content: audioBytes };
      const config: protos.google.cloud.speech.v1.IRecognitionConfig = {
        encoding: protos.google.cloud.speech.v1.RecognitionConfig.AudioEncoding.OGG_OPUS,
        sampleRateHertz: 16000,
        languageCode: "es-CO",
        diarizationConfig: {
          enableSpeakerDiarization: true,
          minSpeakerCount: 2,
          maxSpeakerCount: 2,
        },
        enableAutomaticPunctuation: true,
        enableWordTimeOffsets: true,
      };

      const request: protos.google.cloud.speech.v1.ILongRunningRecognizeRequest = {
        audio,
        config,
      };

      const [operation] = await this.client.longRunningRecognize(request);
      console.log(`Google operation started: ${operation.name}`);

      return { id: operation.name || `google-${Date.now()}` };
    } catch (error) {
      console.error("Google submit transcription error:", error);
      throw new Error(`Google submit failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  async getTranscriptionResult(id: string): Promise<{ id: string; text: string; status: string }> {
    try {
      const operation = await this.client.checkLongRunningRecognizeProgress(id);

      if (!operation.done) {
        return {
          id,
          text: "",
          status: "processing",
        };
      }

      if (operation.error) {
        return {
          id,
          text: "",
          status: "error",
        };
      }

      const result = operation.result as protos.google.cloud.speech.v1.ILongRunningRecognizeResponse;
      const transcript =
        result.results
          ?.map((r) => r.alternatives?.[0]?.transcript)
          .filter(Boolean)
          .join(" ") || "";

      return {
        id,
        text: transcript,
        status: "completed",
      };
    } catch (error) {
      console.error("Google get transcription error:", error);
      return {
        id,
        text: "",
        status: "error",
      };
    }
  }
}

export default GoogleTranscriptionService;
export { ITranscriptionService };
