import { RefObject } from "react";
import { formatDate } from "../../modules/shared/utils/formatDate";
import { Transcription } from "../../modules/transcription/types";
import styles from "./TranscriptionList.module.css";

interface TranscriptionCardProps {
  transcription: Transcription;
  onClick: () => void;
  isActive: boolean;
  cardRef: RefObject<HTMLDivElement>;
  color?: string;
}

export const TranscriptionCard = ({ transcription, onClick, isActive, cardRef, color }: TranscriptionCardProps) => {
  return (
    <div
      ref={cardRef}
      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
      style={{ color }}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={`Abrir transcripción: ${transcription.text.substring(0, 50)}...`}
    >
      <div className={styles.cardContent}>
        <header className={styles.cardHeader}>
          <h3 className={styles.cardTitle}>Transcripción #{transcription.id.slice(-8)}</h3>
          <p className={styles.cardDescription}>{transcription.text}</p>
          <time className={styles.cardDate} dateTime={transcription.createdAt}>
            {formatDate(transcription.createdAt)}
          </time>
        </header>
      </div>
    </div>
  );
};
