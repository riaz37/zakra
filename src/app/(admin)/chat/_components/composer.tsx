"use client";

import { useCallback, useRef } from "react";
import { Send, StopCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUIStore, type ReportLanguage } from "@/store/uiStore";

const LANGUAGES: { value: ReportLanguage; label: string }[] = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
  { value: "tr", label: "Turkish" },
  { value: "ur", label: "Urdu" },
  { value: "zh", label: "Chinese" },
  { value: "hi", label: "Hindi" },
];

interface ComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isStreaming: boolean;
}

export function Composer({
  value,
  onChange,
  onSubmit,
  onStop,
  disabled,
  isStreaming,
}: ComposerProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const language = useUIStore((s) => s.reportLanguage);
  const setLanguage = useUIStore((s) => s.setReportLanguage);

  const handleKey = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!disabled && !isStreaming && value.trim()) {
          onSubmit();
        }
      }
    },
    [disabled, isStreaming, value, onSubmit],
  );

  const canSend = !disabled && !isStreaming && value.trim().length > 0;

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)] px-6 py-4">
      <div className="mx-auto flex max-w-[920px] flex-col gap-2">
        <div className="flex items-end gap-2 rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] px-3 py-2 shadow-token-sm transition-colors focus-within:border-[var(--primary)] focus-within:ring-3 focus-within:ring-[var(--ring)]">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask about your data…"
            rows={1}
            aria-label="Message"
            className="block max-h-40 min-h-[24px] grow resize-none border-0 bg-transparent py-1.5 font-sans text-[14px] leading-[22px] text-[var(--fg)] outline-none placeholder:text-[var(--fg-subtle)]"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={onStop}
              aria-label="Stop generating"
              className="inline-flex size-9 items-center justify-center rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] text-[var(--fg)] transition-colors hover:bg-[var(--surface-muted)]"
            >
              <StopCircle className="size-[18px]" strokeWidth={1.75} />
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={!canSend}
              aria-label="Send message"
              className="inline-flex size-9 items-center justify-center rounded-[10px] bg-[var(--primary)] text-[var(--primary-fg)] transition-colors hover:bg-[var(--primary-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-[16px]" strokeWidth={1.75} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 px-1 text-[12px] text-[var(--fg-subtle)]">
          <Select
            value={language}
            onValueChange={(v) => setLanguage(v as ReportLanguage)}
          >
            <SelectTrigger
              size="sm"
              aria-label="Response language"
              className="h-7 min-w-[124px] rounded-[var(--radius-input)] border-[var(--border-strong)] px-2.5 text-[12px]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="grow" />
          <span>
            <kbd className="rounded bg-[var(--surface-muted)] px-1 py-0.5 font-mono text-[11px] text-[var(--fg-muted)]">
              Enter
            </kbd>{" "}
            to send ·{" "}
            <kbd className="rounded bg-[var(--surface-muted)] px-1 py-0.5 font-mono text-[11px] text-[var(--fg-muted)]">
              Shift+Enter
            </kbd>{" "}
            for newline
          </span>
        </div>
      </div>
    </div>
  );
}
