import { useState, useRef, useEffect, DragEvent, ChangeEvent } from 'react';
import { FileAttachState } from '../types';
import { uploadFileToS3 } from '../utils/upload';

interface UseFileUploadOptions {
  validFileFormats: string[];
  onUploadSuccess?: (data: any) => void;
  onUploadError?: (error: unknown) => void;
}

export function useFileUpload({
  validFileFormats,
  onUploadSuccess,
  onUploadError,
}: UseFileUploadOptions) {
  const [file, setFile] = useState<File | null>(null);
  const [fileAttachState, setFileAttachState] = useState<FileAttachState>(FileAttachState.NoFile);
  const [dragCounter, setDragCounter] = useState(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Only upload if file is set and state is NoFile or DragOver (not after error or uploading)
    if (!file) {
      return;
    }
    if (
      fileAttachState !== FileAttachState.NoFile &&
      fileAttachState !== FileAttachState.DragOver
    ) {
      return;
    }
    const uploadFile = async () => {
      try {
        setFileAttachState(FileAttachState.Uploading);
        const data = await uploadFileToS3(file);
        setFileAttachState(FileAttachState.Uploaded);
        onUploadSuccess?.(data);
      } catch (err: unknown) {
        setFileAttachState(FileAttachState.UploadFailed);
        setFile(null); // Reset file so effect doesn't re-trigger
        onUploadError?.(err);
      }
    };
    uploadFile();
  }, [file]);

  const fileUpload = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = event.target as HTMLInputElement;
    const attachedFile = target.files?.[0] || event.dataTransfer?.files?.[0];

    if (!attachedFile) {
      return;
    }

    const fileExtension = attachedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validFileFormats.includes(fileExtension)) {
      setFileAttachState(FileAttachState.UnsupportedType);
      setFile(null); // Reset file so effect doesn't re-trigger
      return;
    }
    setFile(attachedFile);
  };

  const handleFormDragEnter = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDragCounter((prev) => prev + 1);
    setFileAttachState(FileAttachState.DragOver);
  };

  const handleFormDragLeave = (event: DragEvent<HTMLFormElement>) => {
    event.preventDefault();
    setDragCounter((prev) => Math.max(prev - 1, 0));
    if (dragCounter === 1) {
      setFileAttachState(FileAttachState.NoFile);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] ?? null;

    if (!selectedFile) {
      return;
    }

    const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !validFileFormats.includes(fileExtension)) {
      setFileAttachState(FileAttachState.UnsupportedType);
      setFile(null);
      return;
    }
    setFile(selectedFile);
  };

  return {
    file,
    setFile,
    fileAttachState,
    setFileAttachState,
    dragCounter,
    setDragCounter,
    fileInputRef,
    fileUpload,
    handleFormDragEnter,
    handleFormDragLeave,
    handleFileChange,
  };
}
