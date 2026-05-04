"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  ArrowUp,
  Square,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  Loader2,
  AlertCircle,
  Copy,
  Database,
  ChevronDown,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { DatabaseConnection } from "@/types/db-connection";

export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  textContent?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

interface ChatInputProps {
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number;
  acceptedFileTypes?: string[];
  // Connection selector
  connections?: DatabaseConnection[];
  selectedConnectionId?: string | null;
  onConnectionChange?: (id: string) => void;
  connectionLocked?: boolean;
}

const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const PASTE_THRESHOLD = 200;

// ── File type helpers ──────────────────────────────────────────────────────

function getFileIcon(type: string) {
  if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4 text-muted" />;
  if (type.startsWith("video/")) return <Video className="h-4 w-4 text-muted" />;
  if (type.startsWith("audio/")) return <Music className="h-4 w-4 text-muted" />;
  if (type.includes("zip") || type.includes("rar") || type.includes("tar"))
    return <Archive className="h-4 w-4 text-muted" />;
  return <FileText className="h-4 w-4 text-muted" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${Number.parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getFileTypeLabel(type: string): string {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.includes("-")) label = label.substring(0, label.indexOf("-"));
  return label.length > 10 ? label.substring(0, 10) + "…" : label;
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toUpperCase() ?? "FILE";
  return ext.length > 8 ? ext.substring(0, 8) + "…" : ext;
}

function isTextualFile(file: File): boolean {
  const textualMimes = [
    "text/",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/typescript",
  ];
  const textualExts = [
    "txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "htm",
    "css", "scss", "sass", "json", "xml", "yaml", "yml", "csv",
    "sql", "sh", "bash", "php", "rb", "go", "java", "c", "cpp",
    "h", "hpp", "cs", "rs", "swift", "kt", "scala", "r", "vue",
    "svelte", "astro", "config", "conf", "ini", "toml", "log",
  ];

  const isMime = textualMimes.some((t) => file.type.toLowerCase().startsWith(t));
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  const isExt =
    textualExts.includes(ext) ||
    /^(readme|dockerfile|makefile)$/i.test(file.name.split("/").pop() ?? "");

  return isMime || isExt;
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? "");
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

// ── Overlay badge (shared by both card types) ─────────────────────────────

function CardBadge({ label }: { label: string }) {
  return (
    <span
      className="capitalize font-mono text-micro px-1.5 py-0.5 rounded-md bg-surface-500 text-foreground border border-border"
    >
      {label}
    </span>
  );
}

// ── File preview card ──────────────────────────────────────────────────────

function FilePreviewCard({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove: (id: string) => void;
}) {
  const isImage = file.type.startsWith("image/");
  const isTextual = isTextualFile(file.file);

  if (isTextual) return <TextualFilePreviewCard file={file} onRemove={onRemove} />;

  return (
    <div
      className="relative group flex-shrink-0 overflow-hidden rounded-lg size-[116px] bg-surface-400 border border-border"
    >
      {isImage && file.preview ? (
        <img
          src={file.preview}
          alt={file.file.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex flex-col gap-1 p-2.5 h-full">
          {getFileIcon(file.type)}
          <p
            className="font-sans text-body font-medium truncate mt-auto text-foreground"
            title={file.file.name}
          >
            {file.file.name}
          </p>
          <p className="font-mono text-micro text-muted">
            {formatFileSize(file.file.size)}
          </p>
        </div>
      )}

      {/* Overlay on non-image cards */}
      {!isImage && (
        <div
          className="absolute inset-0 flex items-end justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: "linear-gradient(to top, var(--color-surface-400) 30%, transparent)" }}
        />
      )}

      {/* Type badge */}
      <div className="absolute bottom-2 left-2">
        <CardBadge label={getFileTypeLabel(file.type)} />
      </div>

      {/* Status icons */}
      {file.uploadStatus === "uploading" && (
        <div className="absolute top-2 left-2">
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
        </div>
      )}
      {file.uploadStatus === "error" && (
        <div className="absolute top-2 left-2">
          <AlertCircle className="h-3 w-3 text-error" />
        </div>
      )}

      {/* Remove button */}
      <button
        className="absolute top-1.5 right-1.5 h-5 w-5 cursor-pointer rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-surface-500 border border-border"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-3 w-3 text-foreground" />
      </button>
    </div>
  );
}

// ── Textual file preview card ──────────────────────────────────────────────

function TextualFilePreviewCard({
  file,
  onRemove,
}: {
  file: FileWithPreview;
  onRemove: (id: string) => void;
}) {
  const ext = getFileExtension(file.file.name);

  return (
    <div
      className="relative group flex-shrink-0 overflow-hidden rounded-lg size-[116px] bg-surface-400 border border-border"
    >
      {/* Content preview */}
      <div className="p-2 h-full overflow-hidden">
        {file.textContent ? (
          <p
            className="font-mono text-micro leading-relaxed whitespace-pre-wrap break-words line-clamp-[9] text-fg-muted"
          >
            {file.textContent}
          </p>
        ) : (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-4 w-4 animate-spin text-muted" />
          </div>
        )}
      </div>

      {/* Bottom gradient overlay */}
      <div
        className="absolute inset-x-0 bottom-0 h-10 flex items-end justify-between px-2 pb-2"
        style={{ background: "linear-gradient(to top, var(--color-surface-400), transparent)" }}
      >
        <CardBadge label={ext} />
      </div>

      {/* Status icons */}
      {file.uploadStatus === "uploading" && (
        <div className="absolute top-2 left-2">
          <Loader2 className="h-3 w-3 animate-spin text-accent" />
        </div>
      )}
      {file.uploadStatus === "error" && (
        <div className="absolute top-2 left-2">
          <AlertCircle className="h-3 w-3 text-error" />
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {file.textContent && (
          <button
            className="h-5 w-5 cursor-pointer rounded flex items-center justify-center bg-surface-500 border border-border"
            onClick={() => void navigator.clipboard.writeText(file.textContent ?? "")}
            title="Copy content"
          >
            <Copy className="h-3 w-3 text-foreground" />
          </button>
        )}
        <button
          className="h-5 w-5 rounded flex items-center justify-center bg-surface-500 border border-border"
          onClick={() => onRemove(file.id)}
          title="Remove"
        >
          <X className="h-3 w-3 text-foreground" />
        </button>
      </div>
    </div>
  );
}

// ── Pasted content card ────────────────────────────────────────────────────

function PastedContentCard({
  content,
  onRemove,
}: {
  content: PastedContent;
  onRemove: (id: string) => void;
}) {
  return (
    <div
      className="relative group flex-shrink-0 overflow-hidden rounded-lg size-[116px] bg-surface-400 border border-border"
    >
      <div className="p-2 h-full overflow-hidden">
        <p
          className="font-mono text-micro leading-relaxed whitespace-pre-wrap break-words line-clamp-[9] text-fg-muted"
        >
          {content.content}
        </p>
      </div>

      <div
        className="absolute inset-x-0 bottom-0 h-10 flex items-end justify-between px-2 pb-2"
        style={{ background: "linear-gradient(to top, var(--color-surface-400), transparent)" }}
      >
        <CardBadge label="PASTED" />
      </div>

      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="h-5 w-5 rounded flex items-center justify-center bg-surface-500 border border-border"
          onClick={() => void navigator.clipboard.writeText(content.content)}
          title="Copy"
        >
          <Copy className="h-3 w-3 text-foreground" />
        </button>
        <button
          className="h-5 w-5 rounded flex items-center justify-center bg-surface-500 border border-border"
          onClick={() => onRemove(content.id)}
          title="Remove"
        >
          <X className="h-3 w-3 text-foreground" />
        </button>
      </div>
    </div>
  );
}

// ── DB selector button (lives in action bar) ───────────────────────────────

const SEARCH_THRESHOLD = 7;

function DbSelectorButton({
  connections,
  selectedConnectionId,
  onConnectionChange,
  locked = false,
}: {
  connections: DatabaseConnection[];
  selectedConnectionId?: string | null;
  onConnectionChange?: (id: string) => void;
  locked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = connections.find((c) => c.id === selectedConnectionId);
  const showSearch = connections.length > SEARCH_THRESHOLD;
  const filtered = search.trim()
    ? connections.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.database_name.toLowerCase().includes(search.toLowerCase()),
      )
    : connections;

  const handleSelect = (id: string) => {
    onConnectionChange?.(id);
    setOpen(false);
    setSearch("");
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSearch("");
  };

  // No connections — CTA link
  if (connections.length === 0) {
    return (
      <a
        href="/connections"
        className="flex h-8 items-center gap-1.5 rounded-lg border border-dashed border-border px-2 font-sans text-body text-fg-muted transition-colors hover:border-border-medium hover:text-foreground"
      >
        <Database className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <span>No databases</span>
      </a>
    );
  }

  // Locked — read-only display (session page)
  if (locked) {
    return (
      <div
        className="flex h-8 items-center gap-1.5 rounded-lg px-2 font-sans text-body text-fg-muted cursor-default select-none"
        title="Connection locked to this session"
      >
        <Database className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
        <span className="text-foreground">{selected?.name ?? "—"}</span>
        {selected?.database_name && (
          <span className="font-mono text-mono-sm text-subtle">
            · {selected.database_name}
          </span>
        )}
      </div>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        className={cn(
          "flex h-8 items-center gap-1.5 rounded-lg border px-2 font-sans text-body transition-colors focus-visible:outline-none",
          selected
            ? "border-border/60 text-foreground hover:border-border-medium hover:bg-surface-400"
            : "border-accent/30 text-accent hover:border-accent/60 hover:bg-accent/5",
        )}
      >
        <Database className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
        <span className="max-w-[120px] truncate">
          {selected ? selected.name : "Select database"}
        </span>
        <ChevronDown
          className={cn(
            "h-3 w-3 shrink-0 transition-transform duration-150",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </PopoverTrigger>

      <PopoverContent
        className="w-72 p-0 overflow-hidden"
        side="top"
        align="start"
        sideOffset={8}
      >
        {showSearch && (
          <div className="border-b border-border px-3 py-2">
            <input
              ref={searchRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search connections…"
              autoFocus
              className="w-full bg-transparent font-sans text-body text-foreground placeholder:text-fg-subtle outline-none"
            />
          </div>
        )}
        <div className="max-h-[240px] overflow-y-auto py-1">
          {filtered.length === 0 ? (
            <p className="px-3 py-2 font-sans text-body text-fg-muted">
              No results
            </p>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleSelect(c.id)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-400",
                  c.id === selectedConnectionId && "bg-surface-300",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-body text-foreground">
                    {c.name}
                  </p>
                  {c.database_name && (
                    <p className="font-mono text-mono-sm text-muted">
                      {c.database_name}
                    </p>
                  )}
                </div>
                <span className="shrink-0 rounded border border-border px-1 py-0.5 font-mono text-mono-sm uppercase tracking-wide text-fg-subtle">
                  {c.database_type}
                </span>
                {c.id === selectedConnectionId && (
                  <Check
                    className="h-3.5 w-3.5 shrink-0 text-accent"
                    strokeWidth={2.5}
                  />
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ── Main ChatInput ─────────────────────────────────────────────────────────

export function ChatInput({
  onSendMessage,
  onStop,
  disabled = false,
  isStreaming = false,
  placeholder = "Ask a question… (Shift+Enter for new line)",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes,
  connections,
  selectedConnectionId,
  onConnectionChange,
  connectionLocked = false,
}: ChatInputProps) {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const prevStreamingRef = useRef(isStreaming);

  // Focus textarea when streaming ends
  useEffect(() => {
    if (prevStreamingRef.current && !isStreaming) {
      textareaRef.current?.focus();
    }
    prevStreamingRef.current = isStreaming;
  }, [isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    const max = 120;
    el.style.height = `${Math.min(el.scrollHeight, max)}px`;
  }, [message]);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const available = maxFiles - files.length;
      if (available <= 0) {
        toast.warning(`Max ${maxFiles} files. Remove some to add more.`);
        return;
      }

      const toAdd = Array.from(selectedFiles).slice(0, available);
      if (selectedFiles.length > available) {
        toast.info(`Only ${available} slot(s) left — added first ${available} file(s).`);
      }

      const validated = toAdd.filter((file) => {
        if (file.size > maxFileSize) {
          toast.error(`${file.name} exceeds ${formatFileSize(maxFileSize)} limit.`);
          return false;
        }
        if (
          acceptedFileTypes &&
          !acceptedFileTypes.some(
            (t) => file.type.includes(t) || t === file.name.split(".").pop()
          )
        ) {
          toast.error(`${file.name}: unsupported type.`);
          return false;
        }
        return true;
      });

      const newFiles: FileWithPreview[] = validated.map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        type: file.type || "application/octet-stream",
        uploadStatus: "uploading",
        uploadProgress: 0,
      }));

      setFiles((prev) => [...prev, ...newFiles]);

      newFiles.forEach((fw) => {
        // Read text content for textual files
        if (isTextualFile(fw.file)) {
          readFileAsText(fw.file)
            .then((textContent) =>
              setFiles((prev) =>
                prev.map((f) => (f.id === fw.id ? { ...f, textContent } : f))
              )
            )
            .catch(() =>
              setFiles((prev) =>
                prev.map((f) =>
                  f.id === fw.id ? { ...f, textContent: "Error reading file" } : f
                )
              )
            );
        }

        // Simulate upload progress
        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.random() * 25 + 5;
          if (progress >= 100) {
            clearInterval(interval);
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fw.id ? { ...f, uploadStatus: "complete", uploadProgress: 100 } : f
              )
            );
          } else {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fw.id ? { ...f, uploadProgress: progress } : f
              )
            );
          }
        }, 120);
      });
    },
    [files.length, maxFiles, maxFileSize, acceptedFileTypes]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const items = Array.from(e.clipboardData.items);

      const fileItems = items.filter((i) => i.kind === "file");
      if (fileItems.length > 0 && files.length < maxFiles) {
        e.preventDefault();
        const dt = new DataTransfer();
        fileItems
          .map((i) => i.getAsFile())
          .filter((f): f is File => f !== null)
          .forEach((f) => dt.items.add(f));
        handleFileSelect(dt.files);
        return;
      }

      const text = e.clipboardData.getData("text");
      if (text && text.length > PASTE_THRESHOLD && pastedContent.length < 5) {
        e.preventDefault();
        setMessage((prev) => prev + text.slice(0, PASTE_THRESHOLD) + "…");
        setPastedContent((prev) => [
          ...prev,
          {
            id: crypto.randomUUID(),
            content: text,
            timestamp: new Date(),
            wordCount: text.split(/\s+/).filter(Boolean).length,
          },
        ]);
      }
    },
    [handleFileSelect, files.length, maxFiles, pastedContent.length]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files) handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleSend = useCallback(() => {
    if (!message.trim() && files.length === 0 && pastedContent.length === 0) return;
    if (files.some((f) => f.uploadStatus === "uploading")) {
      toast.warning("Wait for files to finish uploading.");
      return;
    }

    onSendMessage?.(message, files, pastedContent);

    setMessage("");
    files.forEach((f) => { if (f.preview) URL.revokeObjectURL(f.preview); });
    setFiles([]);
    setPastedContent([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }, [message, files, pastedContent, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        if (isStreaming) return;
        handleSend();
      }
    },
    [handleSend, isStreaming]
  );

  const canSend =
    (message.trim() || files.length > 0 || pastedContent.length > 0) &&
    !disabled &&
    !isStreaming &&
    !files.some((f) => f.uploadStatus === "uploading");

  const hasAttachments = files.length > 0 || pastedContent.length > 0;

  return (
    <div
      className="relative w-full"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {isDragging && (
        <div
          className="absolute inset-0 z-50 rounded-[var(--radius-xl)] flex items-center justify-center pointer-events-none bg-accent-soft border-2 border-dashed border-accent"
        >
          <p
            className="font-sans text-body flex items-center gap-2 text-accent"
          >
            <ImageIcon className="h-4 w-4 opacity-60" />
            Drop files to attach
          </p>
        </div>
      )}

      <div
        className="flex flex-col rounded-[var(--radius-xl)] border border-border-medium bg-surface-200 transition-colors duration-150 focus-within:border-accent/50"
      >
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isStreaming}
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-subheading outline-none focus-visible:shadow-none disabled:opacity-50 font-sans text-foreground leading-normal max-h-[120px] overflow-y-auto"
          style={{ caretColor: "var(--color-accent)" }}
        />

        {/* Action bar */}
        <div className="flex items-center justify-between px-3 pb-2.5">
          {/* Left: db selector + attach */}
          <div className="flex items-center gap-1">
            {connections !== undefined && (
              <DbSelectorButton
                connections={connections}
                selectedConnectionId={selectedConnectionId}
                onConnectionChange={onConnectionChange}
                locked={connectionLocked}
              />
            )}
          </div>

          {/* Right: send / stop */}
          <div className="flex items-center gap-2">
            {/* File count badge */}
            {files.length > 0 && (
              <span
                className="font-mono text-micro px-1.5 py-0.5 rounded-md text-fg-muted bg-surface-400"
              >
                {files.length}/{maxFiles}
              </span>
            )}

            {isStreaming ? (
              <button
                onClick={onStop}
                className="flex cursor-pointer items-center gap-1.5 rounded-[var(--radius-lg)] px-3 py-1.5 font-sans text-body transition-colors hover:opacity-80 bg-error text-foreground"
              >
                <Square className="h-3.5 w-3.5" />
                Stop
              </button>
            ) : (
              <button
                onClick={handleSend}
                disabled={!canSend}
                className={cn(
                  "flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed",
                  canSend ? "bg-accent text-background" : "bg-surface-400 text-muted",
                )}
                title="Send (Enter)"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Attachment tray */}
        {hasAttachments && (
          <div
            className="overflow-x-auto border-t border-border px-3 pb-3 pt-1"
          >
            <div className="flex gap-2">
              {pastedContent.map((c) => (
                <PastedContentCard
                  key={c.id}
                  content={c}
                  onRemove={(id) =>
                    setPastedContent((prev) => prev.filter((x) => x.id !== id))
                  }
                />
              ))}
              {files.map((f) => (
                <FilePreviewCard key={f.id} file={f} onRemove={removeFile} />
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
