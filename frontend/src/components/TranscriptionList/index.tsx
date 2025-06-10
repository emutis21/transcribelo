import { Transcription } from '../../types';
import { CardModal } from "../ModalTanscription/CardModal.component";
import style from "./TranscriptionList.module.css";

interface UrlModalType {
  currentTranscriptionId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

export const TranscriptionList = ({
  transcriptions,
  urlModal,
  removeTranscription,
  isLoading = false,
  recentlyAddedId = null,
}: {
  transcriptions: Transcription[];
  urlModal: UrlModalType;
  removeTranscription: (id: string) => void;
  isLoading?: boolean;
  recentlyAddedId?: string | null;
}) => {
  return (
    <div className={style.transcriptionsList}>
      {transcriptions.map((transcription) => (
        <CardModal
          key={transcription.id}
          transcription={transcription}
          urlModal={urlModal}
          removeTranscription={removeTranscription}
          isLoading={isLoading}
          recentlyAddedId={recentlyAddedId ?? null}
        />
      ))}
    </div>
  );
};
