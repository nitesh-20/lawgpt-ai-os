/**
 * Chat / orchestrator data access. Backed by mock data until the real endpoints below exist.
 * See /MISSING_BACKEND.md for the full contract.
 *
 * GET  /chat/suggested-prompts -> string[]
 * POST /chat/stream            -> Server-Sent-Events stream of { token, done, citations? }
 */
import { suggestedPrompts } from "@/data/chatMocks";
import { streamMockResponse, type StreamChunk } from "@/utils/chatUtils";
import type { UploadedDocument } from "@/types/chat";

export async function getSuggestedPrompts(): Promise<string[]> {
  return suggestedPrompts;
}

export function streamChatResponse(
  userMessage: string,
  documents: UploadedDocument[] = []
): AsyncGenerator<StreamChunk> {
  return streamMockResponse(userMessage, documents);
}
