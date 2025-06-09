import { useState, memo } from "react";
import styles from "./InputFile.module.css";

interface InputFileProps {
  onFileSelect: (file: File | null) => void;
  disabled?: boolean;
  loading?: boolean;
  accept?: string;
  placeholder?: string;
}

export const InputFile = memo(
  ({
    onFileSelect,
    disabled = false,
    loading = false,
    accept = "audio/mpeg",
    placeholder = "Arrastra y suelta tu archivo aquí o haz clic para seleccionar",
  }: InputFileProps) => {
    const [isDragOver, setIsDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setSelectedFile(file);
      onFileSelect(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled && !loading) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled || loading) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    };

    const isInteractionDisabled = disabled || loading;

    return (
      <div className={styles.container}>
        <input
          id="file-input"
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={isInteractionDisabled}
          className={styles.input}
        />
        <label
          htmlFor="file-input"
          className={`
            ${styles.labelFile} 
            ${isDragOver ? styles.dragOver : ""} 
            ${isInteractionDisabled ? styles.disabled : ""}
            ${loading ? styles.loading : ""}
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {loading ? (
            <p className={styles.placeholder}>Procesando archivo...</p>
          ) : selectedFile ? (
            <div className={styles.fileSelected}>
              <p className={styles.fileName}>{selectedFile.name}</p>
              <p className={styles.fileSize}>{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          ) : (
            <p className={styles.placeholder}>{placeholder}</p>
          )}
        </label>
      </div>
    );
  },
);
