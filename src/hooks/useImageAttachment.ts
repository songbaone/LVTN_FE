import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

export interface ImageAttachmentState {
  /** The selected image file, or null */
  selectedImage: File | null;
  /** Object URL for previewing the image */
  previewUrl: string | null;
  /** Whether an upload is in progress */
  uploading: boolean;
}

export interface ImageAttachmentActions {
  /** Validate and select an image file */
  selectImage: (file: File) => void;
  /** Remove the selected image and revoke its preview URL */
  removeImage: () => void;
  /** Set upload progress state */
  setUploading: (v: boolean) => void;
  /** Clear everything (after successful send) */
  clearImage: () => void;
  /** A ref for the hidden file input */
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const EMPTY_REF = { current: null } as React.RefObject<HTMLInputElement | null>;

/**
 * Shared hook for image attachment selection, preview, and validation.
 * Extracted from LiveSupportChat to be reused in Admin Chat.
 */
export function useImageAttachment(additionalFileInputRef?: React.RefObject<HTMLInputElement | null>): ImageAttachmentState & ImageAttachmentActions {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const internalRef = useRef<HTMLInputElement>(null);
  const fileInputRef = additionalFileInputRef ?? internalRef as unknown as React.RefObject<HTMLInputElement | null>;

  // Clean up preview URL on unmount or when preview changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const selectImage = useCallback((file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ các định dạng: JPG, PNG, GIF, WebP");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Kích thước ảnh tối đa là 10MB");
      return;
    }

    // Revoke previous preview URL to avoid memory leaks
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    setSelectedImage(file);
  }, []);

  const removeImage = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedImage(null);
    // Reset the file input so the same file can be picked again
    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  }, [fileInputRef]);

  const clearImage = useCallback(() => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setSelectedImage(null);
    if (fileInputRef?.current) {
      fileInputRef.current.value = "";
    }
  }, [fileInputRef]);

  return {
    selectedImage,
    previewUrl,
    uploading,
    selectImage,
    removeImage,
    setUploading,
    clearImage,
    fileInputRef,
  };
}

export { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE };