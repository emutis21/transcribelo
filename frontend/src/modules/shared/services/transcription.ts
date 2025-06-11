import { envConfig } from "../../../config";

export interface TranscriptionResult {
  id: string;
  status: "processing" | "completed" | "error";
  message: string;
  text: string | null;
}

export const getTranscription = async (id: string): Promise<[Error?, TranscriptionResult?]> => {
  try {
    const response = await fetch(`${envConfig.apiHost}/api/transcription?id=${id}`);

    if (!response.ok) {
      return [new Error(`Error: ${response.statusText}`)];
    }

    const result = (await response.json()) as TranscriptionResult;
    return [undefined, result];
  } catch (error) {
    if (error instanceof Error) return [error];
    return [new Error("Error desconocido")];
  }
};

export const waitForTranscription = async (id: string): Promise<[Error?, TranscriptionResult?]> => {
  let attempts = 0;
  const maxAttempts = 60;

  while (attempts < maxAttempts) {
    const [error, result] = await getTranscription(id);

    if (error) return [error];
    if (!result) return [new Error("No result received")];

    if (result.status === "completed") {
      return [undefined, result];
    }

    if (result.status === "error") {
      return [new Error(result.message)];
    }

    await new Promise((resolve) => setTimeout(resolve, 5000));
    attempts++;
  }

  return [new Error("Timeout: Transcripción tardó demasiado")];
};
