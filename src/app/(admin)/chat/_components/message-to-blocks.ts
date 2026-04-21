import type {
  ChatMessage,
  MessageContentBlock,
  QueryResultData,
  ReportLinkData,
  ReportPickerData,
  SearchResultData,
} from "@/types/chat";

/**
 * Convert a persisted ChatMessage into the content-block list rendered by
 * MessageContent. Text-only messages become a single text block; typed
 * messages read the structured payload from metadata_json.
 */
export function messageToBlocks(message: ChatMessage): MessageContentBlock[] {
  const meta = message.metadata_json ?? {};
  const blocks: MessageContentBlock[] = [];

  if (message.content && message.content.length > 0) {
    blocks.push({ type: "text", text: message.content });
  }

  switch (message.message_type) {
    case "query_result": {
      const qr = meta.query_result ?? meta;
      if (qr && typeof qr === "object") {
        blocks.push({
          type: "query_result",
          query_result: qr as unknown as QueryResultData,
        });
      }
      break;
    }
    case "report_link": {
      const rl = meta.report ?? meta;
      if (rl && typeof rl === "object") {
        blocks.push({
          type: "report_link",
          report: rl as unknown as ReportLinkData,
        });
      }
      break;
    }
    case "search_result": {
      const sr = meta.search_results ?? meta;
      if (sr && typeof sr === "object") {
        blocks.push({
          type: "search_result",
          search_results: sr as unknown as SearchResultData,
        });
      }
      break;
    }
    case "report_picker": {
      const rp = meta.report_picker ?? meta;
      if (rp && typeof rp === "object") {
        blocks.push({
          type: "report_picker",
          report_picker: rp as unknown as ReportPickerData,
        });
      }
      break;
    }
    case "error": {
      const errCode =
        typeof meta.code === "string" ? meta.code : "error";
      blocks.push({
        type: "error",
        error: {
          code: errCode,
          message: message.content || "Something went wrong.",
        },
      });
      // Error carries its message through the error block, not text.
      return blocks.filter((b) => !(b.type === "text"));
    }
    case "text":
    default:
      // already added as text block
      break;
  }

  return blocks;
}
