import { useState, useRef, KeyboardEvent, ChangeEvent, forwardRef, useImperativeHandle } from "react";
import { Smile, Paperclip, Image, Send, Loader2, Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Textarea } from "../../ui/textarea";
import { cn } from "../../ui/utils";
import type { ImageAttachmentState, ImageAttachmentActions } from "../../../../hooks/useImageAttachment";

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  onFileSelect?: (file: File) => void;
  /** Image attachment state from useImageAttachment hook */
  imageAttachment?: ImageAttachmentState & ImageAttachmentActions;
}

export interface MessageInputHandle {
  reset: () => void;
}

const MessageInput = forwardRef<MessageInputHandle, MessageInputProps>(function MessageInput(
  { onSend, disabled, onFileSelect, imageAttachment },
  ref
) {
  const [text, setText] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine which file input ref to use — shared hook's or our own
  const actualImageInputRef = imageAttachment?.fileInputRef ?? useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setText("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    },
  }));

  const handleSend = () => {
    const trimmed = text.trim();
    if (disabled) return;
    if (!trimmed && !imageAttachment?.selectedImage) return;
    onSend(trimmed);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleFilePick = (type: "file" | "image") => {
    if (type === "file") {
      fileInputRef.current?.click();
    } else {
      actualImageInputRef.current?.click();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === "image" && imageAttachment) {
      imageAttachment.selectImage(file);
    } else if (onFileSelect) {
      onFileSelect(file);
    }
    e.target.value = "";
  };

  const isDisabled = disabled;
  const canSend = (text.trim().length > 0 || !!imageAttachment?.selectedImage) && !isDisabled;
  const isUploading = imageAttachment?.uploading ?? false;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="flex-shrink-0 bg-card border-t border-border">
      {/* Image Preview Panel */}
      {imageAttachment?.previewUrl && imageAttachment?.selectedImage && (
        <div className="px-4 pt-3">
          <div className="relative bg-background rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-2">
              <div className="size-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={imageAttachment.previewUrl}
                  alt="Preview"
                  className="size-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{imageAttachment.selectedImage.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(imageAttachment.selectedImage.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={imageAttachment.removeImage}
                disabled={isUploading}
                title="Xóa ảnh"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Uploading indicator */}
      {isUploading && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-full w-fit">
            <Loader2 className="size-3 animate-spin" />
            Đang tải ảnh lên...
          </div>
        </div>
      )}

      <div className="px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Attach buttons */}
          <div className="flex items-center gap-0.5 pb-1.5">
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z"
              className="hidden"
              onChange={(e) => handleFileChange(e, "file")}
            />
            <input
              ref={actualImageInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={(e) => handleFileChange(e, "image")}
            />
            {/* <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              title="Đính kèm file"
              disabled={isDisabled || isUploading}
              onClick={() => handleFilePick("file")}
            >
              <Paperclip className="size-4" />
            </Button> */}
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50",
                imageAttachment?.selectedImage && "text-primary bg-primary/10 hover:text-primary hover:bg-primary/15"
              )}
              title="Gửi hình ảnh"
              disabled={isDisabled || isUploading}
              onClick={() => handleFilePick("image")}
            >
              <Image className="size-4" />
            </Button>
          </div>

          {/* Textarea */}
          <div
            className={cn(
              "flex-1 relative rounded-xl border transition-all duration-200 bg-background",
              isDisabled && "opacity-50",
              isFocused
                ? "border-primary/50 ring-1 ring-primary/20 shadow-sm"
                : "border-border hover:border-muted-foreground/20"
            )}
          >
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onInput={handleInput}
              placeholder={isDisabled ? "Cuộc trò chuyện đã kết thúc" : "Nhập tin nhắn..."}
              rows={1}
              disabled={isDisabled || isUploading}
              className="min-h-[40px] max-h-[120px] resize-none border-none bg-transparent px-3 py-2.5 text-sm rounded-xl focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50"
            />

            {/* Emoji button inside textarea */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1.5 bottom-1.5 size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50"
              title="Chèn biểu tượng"
              disabled={isDisabled || isUploading}
            >
              <Smile className="size-4" />
            </Button>
          </div>

          {/* Send button */}
          <Button
            onClick={handleSend}
            disabled={!canSend}
            size="icon"
            className={cn(
              "size-[42px] rounded-xl transition-all duration-200",
              canSend
                ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/20"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Send className="size-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
});

export default MessageInput;