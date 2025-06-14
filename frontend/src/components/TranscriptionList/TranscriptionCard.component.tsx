import { RefObject } from "react";
import { formatDate } from "../../modules/shared/utils/formatDate";
import styles from "./TranscriptionList.module.css";
import { Transcription } from '../../types';

interface TranscriptionCardProps {
  transcription: Transcription;
  onClick: () => void;
  isActive: boolean;
  cardRef: RefObject<HTMLDivElement>;
  color?: string;
  isRecentlyAdded?: boolean;
}

export const TranscriptionCard = ({ transcription, onClick, isActive, cardRef, color, isRecentlyAdded }: TranscriptionCardProps) => {
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
      data-recentlyadded={isRecentlyAdded}
      aria-label={`Abrir transcripción: ${transcription.text.substring(0, 50)}...`}
    >
      {isRecentlyAdded && 
        <span className={styles.recentlyAddedBadge}>Nueva</span>
      }
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
