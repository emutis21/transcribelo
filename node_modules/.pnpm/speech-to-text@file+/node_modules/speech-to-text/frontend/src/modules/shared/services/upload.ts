import { envConfig } from "../../../config";
import { ApiUploadResponse } from "../../../types";

export const uploadFile = async (file: File): Promise<[Error?, unknown?]> => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(`${envConfig.apiHost}/api/files`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) return [new Error(`Error al cargar el archivo: ${response.statusText}`)];

    const json = (await response.json()) as ApiUploadResponse;

    return [undefined, json];
  } catch (error) {
    if (error instanceof Error) return [error];
  }

  return [new Error("Error desconocido")];
};
