import { useCallback, useState } from "react";
import { Toaster, toast } from "sonner";
import { InputFile } from "./components/InputFile";
import { TranscriptionList } from "./components/TranscriptionList/index.tsx";
import { uploadFile } from "./modules/shared/services/upload";
import { useTranscriptions } from "./modules/transcription/hooks/useTranscriptions";
import { useUrlModal } from "./modules/shared/hooks/useUrlModal";
import { ApiUploadResponse } from "./modules/transcription/types";
import { useDocumentTitle } from './modules/shared/hooks/useDocumentTitle';

const APP_STATUS = {
  IDLE: "idle",
  ERROR: "error",
  READY_UPLOAD: "ready_upload",
  UPLOADING: "uploading",
  READY_USAGE: "ready_usage",
  LOADING: "loading",
  DELETING: "deleting",
} as const;

const BUTTON_TEXT = {
  [APP_STATUS.READY_UPLOAD]: "Subir archivo",
  [APP_STATUS.UPLOADING]: "Subiendo archivo...",
} as const;

type AppStatusType = (typeof APP_STATUS)[keyof typeof APP_STATUS];

export function App() {
  const [appStatus, setAppStatus] = useState<AppStatusType>(APP_STATUS.IDLE);
  const [, setData] = useState<{
    message: string;
    transcription: string;
    transcriptId: string | null;
  }>({
    message: "",
    transcription: "",
    transcriptId: null,
  });
  const [file, setFile] = useState<File | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  const { transcriptions, addTranscription, clearTranscriptions, removeTranscription } = useTranscriptions();
  const urlModal = useUrlModal();

  const titleMapping = {
    [APP_STATUS.IDLE]: "Transcríbelo - Convierte audio a texto",
    [APP_STATUS.ERROR]: "Error - Transcríbelo",
    [APP_STATUS.READY_UPLOAD]: "Archivo listo para subir - Transcríbelo",
    [APP_STATUS.UPLOADING]: "Subiendo archivo... - Transcríbelo",
    [APP_STATUS.READY_USAGE]: `${transcriptions.length} transcripciones - Transcríbelo`,
    [APP_STATUS.LOADING]: "Cargando... - Transcríbelo",
    [APP_STATUS.DELETING]: "Eliminando... - Transcríbelo",
  };

  const getDocumentTitle = (): string => {
    if (urlModal.currentTranscriptionId) {
      const currentTranscription = transcriptions.find((t) => t.id === urlModal.currentTranscriptionId);
      return currentTranscription
        ? `Viendo transcripción #${currentTranscription.id.slice(-8)} - Transcríbelo`
        : "Viendo transcripción - Transcríbelo";
    }

    return titleMapping[appStatus];
  };

  useDocumentTitle(getDocumentTitle());

  const handleFileSelect = useCallback((selectedFile: File | null) => {
    setFile(selectedFile);
    if (selectedFile) {
      setAppStatus(APP_STATUS.READY_UPLOAD);
    } else {
      setAppStatus(APP_STATUS.IDLE);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (appStatus !== APP_STATUS.READY_UPLOAD || !file) return;

    setAppStatus(APP_STATUS.UPLOADING);

    const [err, newData] = (await uploadFile(file)) as [Error | undefined, ApiUploadResponse | undefined];

    if (err) {
      setAppStatus(APP_STATUS.ERROR);
      toast.error(err.message);
      return;
    }

    setAppStatus(APP_STATUS.READY_USAGE);
    if (newData) {
      setData({
        message: newData.message,
        transcription: newData.transcription,
        transcriptId: newData.transcriptId,
      });

      addTranscription({
        id: newData.transcriptId,
        text: newData.transcription,
        message: newData.message,
      });

      setRecentlyAddedId(newData.transcriptId);

      setTimeout(() => {
        setRecentlyAddedId(null);
      }, 10000);
    }

    toast.success("Archivo cargado correctamente");
  };

  const handleRemoveTranscription = useCallback(
    async (id: string) => {
      setAppStatus(APP_STATUS.DELETING);
      await removeTranscription(id);
      setAppStatus(APP_STATUS.READY_USAGE);
    },
    [removeTranscription],
  );

  const handleClearTranscriptions = useCallback(async () => {
    setAppStatus(APP_STATUS.DELETING);
    await clearTranscriptions();
    setAppStatus(APP_STATUS.IDLE);
  }, [clearTranscriptions]);

  const showButton = appStatus === APP_STATUS.READY_UPLOAD || appStatus === APP_STATUS.UPLOADING;
  const isLoading =
    appStatus === APP_STATUS.LOADING || appStatus === APP_STATUS.UPLOADING || appStatus === APP_STATUS.DELETING;

  return (
    <>
      <Toaster />
      <header>
        <h1>Transcríbelo</h1>

        <form onSubmit={handleSubmit}>
          <InputFile
            onFileSelect={handleFileSelect}
            disabled={isLoading}
            loading={appStatus === APP_STATUS.UPLOADING}
            accept="audio/mpeg, audio/wav, audio/ogg, audio/mp3, audio/flac, audio/aac"
            placeholder="Arrastra y suelta tu archivo de audio aquí o haz clic para seleccionar"
          />
          {showButton && (
            <button type="submit" disabled={appStatus === APP_STATUS.UPLOADING}>
              {BUTTON_TEXT[appStatus]}
            </button>
          )}
        </form>
      </header>

      <main>
        <h3>Transcripciones guardadas ({transcriptions.length})</h3>

        <TranscriptionList
          transcriptions={transcriptions}
          urlModal={urlModal}
          removeTranscription={handleRemoveTranscription}
          isLoading={isLoading}
          recentlyAddedId={recentlyAddedId}
        />

        {transcriptions.length > 0 && (
          <button onClick={handleClearTranscriptions} disabled={isLoading}>
            {appStatus === APP_STATUS.DELETING ? "Eliminando..." : "Eliminar todas las transcripciones"}
          </button>
        )}
      </main>

      <footer>
        <span>
          Hecho con ❤️ por
          <a href="https://www.linkedin.com/in/emutis/" target="_blank" rel="noopener noreferrer">
            Esteban Mutis
          </a>
        </span>
      </footer>
    </>
  );
}
