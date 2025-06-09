import { CSSProperties, RefObject, useEffect } from "react";
import styles from "./ModalTanscription.module.css";
import { Transcription } from "../../modules/transcription/types";
import { useCopyToClipboard } from "../../modules/shared/hooks/useCopyToClipboard";
import { ClipboardIcon } from "../icons/Clipboard.icon";
import { ConfirmIcon } from "../icons/Confirm.icon";
import { CloseIcon } from "../icons/Close.icon";
import { TrashIcon } from "../icons/Trash.icon.tsx";
import { toast } from "sonner";

interface ModalProps {
  transcription: Transcription;
  closeModal?: () => void;
  showBackground?: boolean;
  modalContentRef?: RefObject<HTMLDivElement>;
  showContent?: boolean;
  animationStyles?: CSSProperties;
  color?: string;
  removeTranscription?: (id: string) => void;
}

export const ModalTanscription = ({
  transcription,
  closeModal,
  showBackground,
  modalContentRef,
  showContent,
  animationStyles,
  color = "#f0f0f0",
  removeTranscription,
}: ModalProps) => {
  const [copiedText, copyToClipboard] = useCopyToClipboard();
  const hasJustCopied = copiedText === transcription.text;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && closeModal) {
        closeModal();
      }
    };

    if (showContent) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showContent, closeModal]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCopyText = async () => {
    const success = await copyToClipboard(transcription.text);
    if (!success) {
      console.error("No se pudo copiar el texto");
    }
  };

  const handleDeleteTranscription = () => {
    if (removeTranscription) {
      removeTranscription(transcription.id);
      toast.success("Transcripción eliminada correctamente");

      if (closeModal) {
        closeModal();
      }
    } else {
      toast.error("No se pudo eliminar la transcripción");
    }
  };

  return (
    <div
      className={styles.transformModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      style={{ color }}
    >
      <div
        className={`${styles.transformModalBackground} ${showBackground ? styles.transformModalBackgroundOpen : ""}`}
        onClick={closeModal}
        aria-label="Cerrar modal"
      />

      <div
        ref={modalContentRef}
        className={`${styles.transformModalContent} ${showContent ? styles.transformModalContentOpen : ""}`}
        style={animationStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {showContent && (
          <div className={styles.modalContent}>
            <header className={styles.modalHeader}>
              <h2 id="modal-title" className={styles.modalTitle}>
                Transcripción #{transcription.id.slice(-8)}
              </h2>
              <time className={styles.modalDate} dateTime={transcription.createdAt}>
                {formatDate(transcription.createdAt)}
              </time>
              <button className={styles.modalClose} onClick={closeModal} aria-label="Cerrar modal" type="button">
                <CloseIcon />
              </button>
            </header>

            <main className={styles.modalBody}>
              <p className={styles.modalDescription}>{transcription.text}</p>
            </main>

            <footer className={styles.modalFooter}>
              <button className={styles.modalButton} type="button" onClick={handleCopyText} disabled={hasJustCopied}>
                {hasJustCopied ? <ConfirmIcon /> : <ClipboardIcon />}
                {hasJustCopied ? "Copiado" : "Copiar texto"}
              </button>
              <button className={styles.modalButton} type="button" onClick={handleDeleteTranscription}>
                <TrashIcon />
                Eliminar transcripción
              </button>
            </footer>
          </div>
        )}
      </div>
    </div>
  );
};
