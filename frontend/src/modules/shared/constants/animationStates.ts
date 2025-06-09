export const ANIMATION_STATES = {
  IDLE: "idle",
  OPENING: "opening",
  OPENED: "opened",
  CLOSING: "closing",
} as const;

export type AnimationState = (typeof ANIMATION_STATES)[keyof typeof ANIMATION_STATES];
