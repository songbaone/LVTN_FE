import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import {
  MessageCircle,
  X,
  Send,
  Paperclip,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { cn } from "../ui/utils";
import { useChatStore } from "../../../stores/chatStore";
import { useSocket } from "../../../hooks/useSocket";
import { mapSocketMessage } from "../../../helpers/chat/messageMapper";
import { getCurrentUserId } from "../../../helpers/chat/getCurrentUserId";
import type { ChatMessage } from "../admin/chat/types";
import MessageBubble from "../admin/chat/MessageBubble";

interface LiveSupportChatProps {
  isOpen: boolean;
  onToggle: () => void;
}

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const SCROLL_TOP_THRESHOLD = 150; // px from top to trigger loading older messages

export default function LiveSupportChat({ isOpen, onToggle }: LiveSupportChatProps) {
  const {
    room,
    messages,
    loading,
    sending,
    error,
    loadOrCreateRoom,
    loadMoreMessages,
    sendMessage,
    uploadAttachment,
    markRead,
    startPolling,
    stopPolling,
    reset,
    dispatchSocketMessage,
    hasMore,
  } = useChatStore();

  // Get current user ID for ownership comparison
  const currentUser = useMemo(() => getCurrentUserId(), []);

  // Socket.IO integration: join room when open and receive realtime messages
  const handleSocketMessage = useCallback((data: any) => {
    console.log("========== SOCKET ==========");
    console.log(data);
    console.log("Attachments:", data.message?.attachments);
    console.log("============================");

    const roomId = data.room?.room_id;

    if (!roomId) return;

    const msg = mapSocketMessage(
      data.message ?? data,
      roomId
    );

    dispatchSocketMessage(msg);

  }, [dispatchSocketMessage]);

  const handleSocketClosed = useCallback(
    (data: any) => {
      if (!room) return;
      loadOrCreateRoom();
    },
    [room, loadOrCreateRoom]
  );

  useSocket({
    role: "customer",
    roomId: isOpen ? room?.id ?? null : null,
    onNewMessage: handleSocketMessage,
    onRoomClosed: handleSocketClosed,
  });

  const [inputText, setInputText] = useState("");
  const [uploadingFile, setUploadingFile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Image preview state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Scroll position tracking
  const prevMessageCountRef = useRef(messages.length);
  const prevLastMessageIdRef = useRef<string | null>(null);
  const isNearBottomRef = useRef(true);
  const prevScrollHeightRef = useRef(0);
  const isPrependingRef = useRef(false);

  // Load room when widget opens
  useEffect(() => {
    if (isOpen) {
      loadOrCreateRoom();
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [isOpen]);

  const checkIfNearBottom = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return true;
    const { scrollTop, scrollHeight, clientHeight } = el;
    return scrollHeight - scrollTop - clientHeight < 100;
  }, []);

  // Scroll handler for infinite scroll (load older) and near-bottom detection
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const handleScroll = () => {
      isNearBottomRef.current = checkIfNearBottom();

      // Infinite scroll: detect when user scrolls near the top
      if (el.scrollTop < SCROLL_TOP_THRESHOLD && hasMore && !loading) {
        isPrependingRef.current = true;
        prevScrollHeightRef.current = el.scrollHeight;
        loadMoreMessages();
      }
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [checkIfNearBottom, loadMoreMessages, hasMore, loading]);

  // Auto-scroll logic + scroll position maintenance when prepending
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const currentMessageCount = messages.length;
    const lastMessage = messages[currentMessageCount - 1];
    const lastMessageId = lastMessage ? String(lastMessage.id) : null;
    const prevCount = prevMessageCountRef.current;
    const prevLastId = prevLastMessageIdRef.current;

    // If we prepended messages (older messages loaded), maintain scroll position
    if (isPrependingRef.current && currentMessageCount > prevCount) {
      const newScrollHeight = el.scrollHeight;
      const heightDiff = newScrollHeight - prevScrollHeightRef.current;
      el.scrollTop = heightDiff; // Keep the visual position stable
      isPrependingRef.current = false;
      prevMessageCountRef.current = currentMessageCount;
      prevLastMessageIdRef.current = lastMessageId;
      return;
    }

    const isNewMessage = currentMessageCount > prevCount && lastMessageId !== prevLastId;
    const shouldScroll =
      isNearBottomRef.current ||
      (prevCount === 0 && currentMessageCount > 0) ||
      (isNewMessage && prevCount > 0);

    if (shouldScroll) {
      requestAnimationFrame(() => {
        el!.scrollTop = el!.scrollHeight;
      });
    }

    prevMessageCountRef.current = currentMessageCount;
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages, loading]);

  // Mark as read when room is loaded
  useEffect(() => {
    if (room) {
      markRead();
    }
  }, [room?.id]);

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleSend = useCallback(async () => {
    if ((!inputText.trim() && !selectedImage) || sending || uploadingFile) return;

    const text = inputText;
    const image = selectedImage;
    let sentOk = false;

    try {
      if (text.trim()) {
        await sendMessage(text.trim());
        sentOk = true;
      }

      if (image) {
        setUploadingFile(true);

        if (!text.trim()) {
          await sendMessage(`📷 ${image.name}`);
          sentOk = true;
        }

        const { messages: updatedMessages } = useChatStore.getState();
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        if (lastMsg) {
          await uploadAttachment(lastMsg.id, image);
        }
      }

      setInputText("");
      setSelectedImage(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    } catch (err: any) {
      if (!sentOk) {
        setInputText(text);
      }
      toast.error(err?.response?.data?.message || "Không thể gửi tin nhắn");
    } finally {
      setUploadingFile(false);
    }
  }, [inputText, selectedImage, previewUrl, sending, uploadingFile, sendMessage, uploadAttachment]);

  const handleFileSelect = useCallback(
    async (file: File) => {
      if (!room) return;

      const fileName = file.name;
      try {
        setUploadingFile(true);

        await sendMessage(`[${file.type.startsWith("image") ? "Hình ảnh" : "File"}]: ${fileName}`);

        const { messages: updatedMessages } = useChatStore.getState();
        const lastMsg = updatedMessages[updatedMessages.length - 1];
        if (lastMsg) {
          await uploadAttachment(lastMsg.id, file);
        }

        toast.success("Đã tải file lên");
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Không thể tải file lên");
      } finally {
        setUploadingFile(false);
      }
    },
    [room, sendMessage, uploadAttachment]
  );

  const handleImageSelect = useCallback((file: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Chỉ hỗ trợ các định dạng: JPG, PNG, GIF, WebP");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast.error("Kích thước ảnh tối đa là 10MB");
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setSelectedImage(file);
  }, [previewUrl]);

  const handleRemoveImage = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedImage(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [previewUrl]);

  const handlePickFile = (type: "file" | "image") => {
    if (type === "file") {
      fileInputRef.current?.click();
    } else {
      imageInputRef.current?.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "file" | "image") => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === "image") {
        handleImageSelect(file);
      } else {
        handleFileSelect(file);
      }
    }
    e.target.value = "";
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const isInitialLoading = loading && !room;

  const canSend = (inputText.trim().length > 0 || selectedImage !== null) && !sending && !uploadingFile;

  // Toggle button
  if (!isOpen) {
    return (
      <Button
        onClick={onToggle}
        className="fixed bottom-6 right-6 size-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg z-50"
      >
        <MessageCircle className="size-6" />
      </Button>
    );
  }
  console.log("Current User:", currentUser);
  console.log("Messages:", messages);
  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 border-2 border-white">
            <AvatarFallback className="bg-white text-primary">S</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-white">Hỗ trợ khách hàng</h3>
            <p className="text-xs text-white/80 flex items-center gap-1">
              <span className={cn(
                "size-2 rounded-full",
                room?.status === "closed" ? "bg-gray-400" : "bg-success"
              )}></span>
              {room?.status === "closed"
                ? "Đã kết thúc"
                : "BabyStore Support"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            stopPolling();
            onToggle();
          }}
          className="text-white hover:bg-white/20"
        >
          <X className="size-5" />
        </Button>
      </div>

      {/* Room Status Banner */}
      {room?.status === "closed" && (
        <div className="p-3 bg-gray-100 border-b border-border">
          <div className="flex items-center gap-2 text-sm">
            <Badge variant="secondary" className="bg-gray-200 text-gray-600 border-gray-300">
              Đã kết thúc
            </Badge>
            <span className="text-muted-foreground text-xs">
              Cuộc trò chuyện này đã kết thúc
            </span>
          </div>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="p-3 bg-destructive/10 border-b border-destructive/20">
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-background"
      >
        {/* Loading indicator for older messages */}
        {loading && messages.length > 0 && (
          <div className="flex justify-center py-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="size-3 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Đang tải tin nhắn cũ hơn...
            </div>
          </div>
        )}

        {isInitialLoading ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <Skeleton className="size-8 rounded-full flex-shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-16 w-3/4 rounded-2xl" />
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <div className="space-y-2">
                <Skeleton className="h-10 w-32 rounded-2xl" />
              </div>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <MessageCircle className="size-12 text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">
              {room ? "Chưa có tin nhắn nào" : "Đang kết nối..."}
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Hãy gửi tin nhắn đầu tiên để bắt đầu
            </p>
          </div>
        ) : (

          messages.map((message: ChatMessage) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUserId={currentUser}
            />
          ))
        )}

        {uploadingFile && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted px-3 py-2 rounded-full">
              <Loader2 className="size-3 animate-spin" />
              Đang tải ảnh lên...
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Panel */}
      {previewUrl && selectedImage && (
        <div className="flex-shrink-0 bg-muted/30 border-t border-border px-4 py-3">
          <div className="relative bg-background rounded-xl border border-border overflow-hidden">
            <div className="flex items-center gap-3 p-2">
              <div className="size-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="size-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{selectedImage.name}</p>
                <p className="text-[10px] text-muted-foreground">
                  {formatFileSize(selectedImage.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={handleRemoveImage}
                title="Xóa ảnh"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Input area - hidden when room is closed */}
      {room?.status !== "closed" && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z"
            className="hidden"
            onChange={(e) => handleFileChange(e, "file")}
          />
          <input
            ref={imageInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={(e) => handleFileChange(e, "image")}
          />

          {/* Quick Replies */}
          <div className="p-3 border-t border-border bg-card">
            <p className="text-xs font-medium text-muted-foreground mb-2">Câu hỏi nhanh:</p>
            <div className="flex gap-2 overflow-x-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText("Tôi có câu hỏi về đơn hàng của tôi")}
                disabled={sending || uploadingFile}
              >
                Kiểm tra đơn hàng
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText("Thắc mắc về sản phẩm")}
                disabled={sending || uploadingFile}
              >
                Thông tin sản phẩm
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setInputText("Tôi cần hoàn tiền")}
                disabled={sending || uploadingFile}
              >
                Hoàn tiền
              </Button>
            </div>
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border bg-card">
            <div className="flex gap-2">
              {/* <Button
                variant="ghost"
                size="icon"
                disabled={sending || uploadingFile}
                onClick={() => handlePickFile("file")}
              >
                <Paperclip className="size-4" />
              </Button> */}
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                placeholder={sending ? "Đang gửi..." : "Nhập tin nhắn..."}
                className="flex-1"
                disabled={sending || uploadingFile}
              />
              <Button
                variant="ghost"
                size="icon"
                disabled={sending || uploadingFile}
                onClick={() => handlePickFile("image")}
                className={cn(
                  "relative",
                  selectedImage && "text-primary bg-primary/10"
                )}
                title="Đính kèm hình ảnh"
              >
                <ImageIcon className="size-4" />
              </Button>
              <Button
                onClick={handleSend}
                size="icon"
                className="bg-primary hover:bg-primary/90"
                disabled={!canSend}
              >
                {uploadingFile ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Chúng tôi thường phản hồi trong vòng 2 phút
            </p>
          </div>
        </>
      )}

    </div>
  );
}