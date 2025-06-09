import { useState } from "react";

const generateLightColor = (): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 95;
  const lightness = Math.floor(Math.random() * 10) + 80;

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

export function useColorGenerator() {
  const [color] = useState(() => generateLightColor());
  return color;
}
