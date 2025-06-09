import { useEffect, useRef } from "react";

export function useDocumentTitle(title: string) {
  const prevTitleRef = useRef<string>();

  useEffect(() => {
    if (prevTitleRef.current === undefined) {
      prevTitleRef.current = document.title;
    }

    document.title = title;

    return () => {
      if (prevTitleRef.current !== undefined) {
        document.title = prevTitleRef.current;
      }
    };
  }, [title]);

  const restoreTitle = () => {
    if (prevTitleRef.current !== undefined) {
      document.title = prevTitleRef.current;
    }
  };

  return { restoreTitle };
}
