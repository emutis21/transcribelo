import { useCallback, useEffect, useState } from "react";

export function useUrlModal() {
  const [currentTranscriptionId, setCurrentTranscriptionId] = useState<string | null>(null);

  const getCurrentId = useCallback(() => {
    const hash = window.location.hash;
    return hash.startsWith("#transcription-") ? hash.replace("#transcription-", "") : null;
  }, []);

  const openModal = useCallback((transcriptionId: string) => {
    window.location.hash = `transcription-${transcriptionId}`;
  }, []);

  const closeModal = useCallback(() => {
    if (window.location.hash) {
      window.history.replaceState("", document.title, window.location.pathname + window.location.search);
      setCurrentTranscriptionId(null);
    }
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const newId = getCurrentId();
      setCurrentTranscriptionId(newId);
    };

    const initialId = getCurrentId();
    setCurrentTranscriptionId(initialId);

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, [getCurrentId]);

  return {
    currentTranscriptionId,
    openModal,
    closeModal,
  };
}
