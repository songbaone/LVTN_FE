import { useState } from "react";
import { FileText, Download, ZoomIn } from "lucide-react";
import { cn } from "../../ui/utils";
import { Dialog, DialogContent } from "../../ui/dialog";
import type { ChatAttachment } from "./types";

/**
 * Build a full image URL from the VITE_API_URL base.
 * The API returns relative URLs like "/uploads/chat/xxx.png".
 * We strip "/api/v1" from the base URL and prepend the server origin.
 */
function buildImageUrl(fileUrl: string): string {
    if (!fileUrl) return "";
    // If it's already an absolute URL, return as-is
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
        return fileUrl;
    }
    // Get the API base URL from env
    const apiBase = import.meta.env.VITE_API_URL || "";
    // Strip "/api/v1" suffix to get the server base
    const serverBase = apiBase.replace(/\/api\/v1\/?$/, "");
    // Combine: serverBase + fileUrl
    return `${serverBase}${fileUrl.startsWith("/") ? "" : "/"}${fileUrl}`;
}

interface AttachmentRendererProps {
    attachments: ChatAttachment[];
    isMine?: boolean;
}

export default function AttachmentRenderer({ attachments, isMine = false }: AttachmentRendererProps) {
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    if (!attachments || attachments.length === 0) return null;

    return (
        <>
            <div className="flex flex-col gap-2">
                {attachments.map((att) => {
                    const isImage = att.mime_type.startsWith("image/");
                    const fullUrl = buildImageUrl(att.file_url);

                    if (isImage) {
                        return (
                            <button
                                key={att.attachment_id}
                                onClick={() => setLightboxUrl(fullUrl)}
                                className="block w-full cursor-pointer focus:outline-none group relative"
                            >
                                <img
                                    src={fullUrl}
                                    alt={att.file_name}
                                    className="w-full object-cover rounded-xl shadow-sm group-hover:opacity-90 transition-opacity cursor-pointer"
                                    style={{ maxWidth: "220px", maxHeight: "260px" }}
                                    loading="lazy"
                                />
                                {/* Zoom indicator on hover */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 rounded-xl">
                                    <ZoomIn className="size-5 text-white drop-shadow-lg" />
                                </div>
                            </button>
                        );
                    }

                    // Non-image file attachment
                    return (
                        <a
                            key={att.attachment_id}
                            href={fullUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={cn(
                                "flex items-center gap-2 text-sm rounded-lg px-2.5 py-2 transition-colors",
                                isMine
                                    ? "text-white/90 hover:bg-white/10"
                                    : "text-foreground hover:bg-muted"
                            )}
                        >
                            <FileText className="size-4 flex-shrink-0" />
                            <span className="truncate flex-1 text-xs underline underline-offset-2">
                                {att.file_name}
                            </span>
                            <Download className="size-3 flex-shrink-0" />
                        </a>
                    );
                })}
            </div>

            {/* Image Lightbox Dialog */}
            <Dialog open={!!lightboxUrl} onOpenChange={(open) => !open && setLightboxUrl(null)}>
                <DialogContent className="
    w-screen
    h-screen
    max-w-none
    max-h-none
    p-4
    bg-black/90
    border-none
    shadow-none
    flex
    items-center
    justify-center
  ">
                    <button
                        onClick={() => setLightboxUrl(null)}
                        className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors z-10"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="size-6"
                        >
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                    {lightboxUrl && (
                        <img
                            src={lightboxUrl}
                            alt="Hình ảnh phóng to"
                            className="w-full h-full object-contain rounded-lg max-h-[85vh]"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}