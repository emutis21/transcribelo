import { useCallback, useEffect, useRef, useState } from "react";
import { ANIMATION_STATES, type AnimationState } from "../constants/animationStates";

const easingFunctions = {
  linear: (t: number) => t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => --t * t * t + 1,
  easeInOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),
};

type Rect = { width: number; height: number; x: number; y: number };

interface UseAnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function useAnimatedModal({ isOpen, onClose }: UseAnimatedModalProps) {
  const [animationState, setAnimationState] = useState<AnimationState>(ANIMATION_STATES.IDLE);
  const [animationStyles, setAnimationStyles] = useState<React.CSSProperties>({});
  const cardRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const getElementRect = useCallback((element: HTMLElement | null): Rect => {
    if (!element) return { width: 0, height: 0, x: 0, y: 0 };
    const rect = element.getBoundingClientRect();
    return {
      width: rect.width,
      height: rect.height,
      x: rect.left,
      y: rect.top,
    };
  }, []);

  const getTargetPosition = useCallback((): Rect => {
    const maxWidth = 800;
    const maxHeight = 600;
    const mW = maxWidth > window.innerWidth ? window.innerWidth - 40 : maxWidth;
    const mH = maxHeight > window.innerHeight ? window.innerHeight - 40 : maxHeight;

    return {
      width: mW,
      height: mH,
      x: window.innerWidth / 2 - mW / 2,
      y: window.innerHeight / 2 - mH / 2,
    };
  }, []);

  const animate = useCallback(
    (
      from: Rect,
      to: Rect,
      duration: number,
      onComplete: () => void,
      onUpdate?: (styles: React.CSSProperties) => void,
    ) => {
      const start = performance.now();

      const animateFrame = (currentTime: number) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        const easingFn = easingFunctions.easeInOutCubic;
        const progressValue = easingFn(progress);

        const currentWidth = from.width + (to.width - from.width) * progressValue;
        const currentHeight = from.height + (to.height - from.height) * progressValue;
        const currentX = from.x + (to.x - from.x) * progressValue;
        const currentY = from.y + (to.y - from.y) * progressValue;

        const newStyles = {
          position: "fixed" as const,
          top: "0",
          left: "0",
          width: `${currentWidth}px`,
          height: `${currentHeight}px`,
          transform: `translate3d(${currentX}px, ${currentY}px, 0)`,
          zIndex: 1000,
          transition: "none",
        };

        setAnimationStyles(newStyles);
        onUpdate?.(newStyles);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animateFrame);
        } else {
          onComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animateFrame);
    },
    [],
  );

  const startOpenAnimation = useCallback(() => {
    if (animationState !== ANIMATION_STATES.IDLE) return;

    setAnimationState(ANIMATION_STATES.OPENING);

    const cardRect = getElementRect(cardRef.current);
    const targetRect = getTargetPosition();

    setAnimationStyles({
      position: "absolute",
      top: "0",
      left: "0",
      width: `${cardRect.width}px`,
      height: `${cardRect.height}px`,
      transform: `translate3d(${cardRect.x}px, ${cardRect.y}px, 0)`,
      zIndex: 1000,
      transition: "none",
    });

    setTimeout(() => {
      animate(cardRect, targetRect, 500, () => {
        setAnimationState(ANIMATION_STATES.OPENED);
        setAnimationStyles({
          position: "absolute",
          top: "50%",
          left: "50%",
          width: `${targetRect.width}px`,
          height: `${targetRect.height}px`,
          transform: "translate(-50%, -50%)",
          zIndex: 1000,
          transition: "none",
          overflowY: "auto",
        });
      });
    }, 16);
  }, [animationState, getElementRect, getTargetPosition, animate]);

  const startCloseAnimation = useCallback(() => {
    if (animationState === ANIMATION_STATES.IDLE) return;

    setAnimationState(ANIMATION_STATES.CLOSING);
    const cardRect = getElementRect(cardRef.current);
    const currentRect = modalContentRef.current ? getElementRect(modalContentRef.current) : getTargetPosition();

    animate(currentRect, cardRect, 500, () => {
      setAnimationState(ANIMATION_STATES.IDLE);
      setAnimationStyles({});
    });
  }, [animationState, getElementRect, getTargetPosition, animate]);

  useEffect(() => {
    if (isOpen && animationState === ANIMATION_STATES.IDLE) {
      startOpenAnimation();
    } else if (!isOpen && (animationState === ANIMATION_STATES.OPENED || animationState === ANIMATION_STATES.OPENING)) {
      startCloseAnimation();
    }
  }, [isOpen, animationState, startOpenAnimation, startCloseAnimation]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    animationState,
    animationStyles,
    cardRef,
    modalContentRef,
    closeModal: onClose,
  };
}
