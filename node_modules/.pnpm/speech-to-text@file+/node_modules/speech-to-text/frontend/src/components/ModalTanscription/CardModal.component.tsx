import { useCallback, memo, useMemo } from "react";
import { Transcription } from "../../modules/transcription/types";
import { useAnimatedModal } from "../../modules/shared/hooks/useAnimatedModal";
import { useColorGenerator } from "../../modules/shared/hooks/useColorGenerator";
import { ANIMATION_STATES } from "../../modules/shared/constants/animationStates";
import { ModalTanscription } from ".";
import styles from "./ModalTanscription.module.css";
import { TranscriptionCard } from "../TranscriptionList/TranscriptionCard.component";

interface UrlModalType {
  currentTranscriptionId: string | null;
  openModal: (id: string) => void;
  closeModal: () => void;
}

interface CardModalProps {
  transcription: Transcription;
  urlModal: UrlModalType;
  removeTranscription: (id: string) => void;
  isLoading?: boolean;
  recentlyAddedId?: string | null;
}

export const CardModal = memo(
  ({ transcription, urlModal, removeTranscription, isLoading = false, recentlyAddedId = null }: CardModalProps) => {
    const { currentTranscriptionId, openModal, closeModal } = urlModal;

    const isOpen = currentTranscriptionId === transcription.id;

    const handleOpenModal = useCallback(() => {
      openModal(transcription.id);
    }, [openModal, transcription.id]);

    const handleCloseModal = useCallback(() => {
      closeModal();
    }, [closeModal]);

    const { animationState, animationStyles, cardRef, modalContentRef } = useAnimatedModal({
      isOpen,
      onClose: handleCloseModal,
    });

    const color = useColorGenerator();
    const isRecentlyAdded = recentlyAddedId === transcription.id;

    const modalStates = useMemo(
      () => ({
        showContent: animationState === ANIMATION_STATES.OPENED,
        showBackground: animationState === ANIMATION_STATES.OPENING || animationState === ANIMATION_STATES.OPENED,
        isActive: animationState === ANIMATION_STATES.OPENING || animationState === ANIMATION_STATES.OPENED,
      }),
      [animationState],
    );

    if (isLoading) {
      return <article className={styles.cardContainer} data-isloading={isLoading} />;
    }

    return (
      <article className={styles.cardContainer} data-recentlyadded={isRecentlyAdded}>
        <TranscriptionCard
          transcription={transcription}
          onClick={handleOpenModal}
          isActive={modalStates.isActive}
          cardRef={cardRef}
          color={color}
        />

        {animationState !== ANIMATION_STATES.IDLE && (
          <ModalTanscription
            transcription={transcription}
            closeModal={handleCloseModal}
            showBackground={modalStates.showBackground}
            modalContentRef={modalContentRef}
            showContent={modalStates.showContent}
            animationStyles={animationStyles}
            color={color}
            removeTranscription={removeTranscription}
          />
        )}
      </article>
    );
  },
);
