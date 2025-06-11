import { envConfig } from "../../../config";
import { ApiUploadResponse } from "../../../types";
import { waitForTranscription } from "./transcription";

export const uploadFile = async (file: File): Promise<[Error?, ApiUploadResponse?]> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${envConfig.apiHost}/api/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return [new Error(`Error al cargar el archivo: ${response.statusText}`)];

    const uploadResult = await response.json();

    if (uploadResult.transcriptId && !uploadResult.transcription) {
      console.log("Waiting for transcription...", uploadResult.transcriptId);

      const [transcriptionError, transcriptionResult] = await waitForTranscription(uploadResult.transcriptId);

      if (transcriptionError) {
        return [transcriptionError];
      }

      if (!transcriptionResult) {
        return [new Error("No transcription result received")];
      }

      const compatibleResponse: ApiUploadResponse = {
        message: transcriptionResult.message,
        transcription: transcriptionResult.text || "",
        transcriptId: transcriptionResult.id,

        status: transcriptionResult.status,
      };

      return [undefined, compatibleResponse];
    }

    return [undefined, uploadResult as ApiUploadResponse];
  } catch (error) {
    if (error instanceof Error) return [error];
    return [new Error("Error desconocido")];
  }
};
