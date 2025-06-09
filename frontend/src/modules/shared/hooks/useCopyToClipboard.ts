import { useState, useCallback, useEffect, useRef } from "react";

type CopyToClipboardResult = [string | null, (text: string) => Promise<boolean>];

export const useCopyToClipboard = (resetDelay: number = 3000): CopyToClipboardResult => {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const timeoutRef = useRef<number>();

  const copyToClipboard = useCallback(
    async (text: string): Promise<boolean> => {
      if (!text) return false;

      try {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(text);
          setCopiedText(text);
        } else {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          textArea.style.position = "fixed";
          textArea.style.opacity = "0";
          textArea.style.left = "-999999px";
          textArea.style.top = "-999999px";

          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          const success = document.execCommand("copy");
          document.body.removeChild(textArea);

          if (!success) {
            return false;
          }

          setCopiedText(text);
        }

        timeoutRef.current = setTimeout(() => {
          setCopiedText(null);
        }, resetDelay);

        return true;
      } catch (error) {
        console.error("Error copiando al portapapeles:", error);
        setCopiedText(null);
        return false;
      }
    },
    [resetDelay],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [copiedText, copyToClipboard];
};
