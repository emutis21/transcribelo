import { Request, Response } from "express";
import diContainer from "../../infrastructure/diContainer";

const getTranscriptionController = async (req: Request, res: Response) => {
  try {
    const { id } = req.query;

    if (!id || typeof id !== "string") {
      return res.status(400).json({
        error: "ID de transcripción requerido",
        message: "Proporciona un ID válido en el query parameter 'id'",
      });
    }

    console.log(`Getting transcription result for ID: ${id}`);

    const result = await diContainer.transcriptionService.getTranscriptionResult(id);

    console.log(`Transcription result:`, result);

    if (result.status === "processing") {
      return res.status(202).json({
        id: result.id,
        status: "processing",
        message: "Transcripción en proceso",
        text: null,
      });
    }

    if (result.status === "error") {
      return res.status(500).json({
        id: result.id,
        status: "error",
        message: "Error en la transcripción",
        text: null,
      });
    }

    return res.status(200).json({
      id: result.id,
      status: "completed",
      message: "Transcripción completada",
      text: result.text,
    });
  } catch (error) {
    console.error("Error getting transcription:", error);
    res.status(500).json({
      error: "Error interno del servidor",
      message: error instanceof Error ? error.message : "Error desconocido",
    });
  }
};

export default getTranscriptionController;
