import { useLocalStorage } from "../../shared/hooks/useLocaleStorage";
import { Transcription } from "../types";

const TRANSCRIPTIONS_KEY = "transcriptions";

const sleep = ({ ms = 500 }: { ms?: number }) => new Promise((resolve) => setTimeout(resolve, ms));

export function useTranscriptions() {
  const [transcriptions, setTranscriptions, clearTranscriptions] = useLocalStorage<Transcription[]>({
    key: TRANSCRIPTIONS_KEY,
    initialValue: [],
  });

  const addTranscription = (transcription: Omit<Transcription, "createdAt">) => {
    const newTranscription: Transcription = {
      ...transcription,
      createdAt: new Date().toISOString(),
    };

    setTranscriptions((prev) => [newTranscription, ...prev]);
  };

  const removeTranscription = async (id: string): Promise<void> => {
    return new Promise((resolve) => {
      sleep({ ms: 500 }).then(() => {
        setTranscriptions((prev) => prev.filter((t) => t.id !== id));
        resolve();
      });
    });
  };

  const clearAllTranscriptions = async (): Promise<void> => {
    return new Promise((resolve) => {
      sleep({ ms: 500 }).then(() => {
        clearTranscriptions();
        resolve();
      });
    });
  };

  const getTranscriptionById = (id: string) => {
    return transcriptions.find((t) => t.id === id);
  };

  return {
    transcriptions,
    addTranscription,
    removeTranscription,
    getTranscriptionById,
    clearTranscriptions: clearAllTranscriptions,
  };
}
