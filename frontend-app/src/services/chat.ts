import { apiClient } from "@/utils/apiClient";
import type { UploadedDocument } from "@/types/chat";
import type { StreamChunk } from "@/utils/chatUtils";
import { suggestedPrompts } from "@/data/chatMocks";

export async function getSuggestedPrompts(): Promise<string[]> {
  return suggestedPrompts;
}

export async function* streamChatResponse(
  userMessage: string,
  documents: UploadedDocument[] = []
): AsyncGenerator<StreamChunk> {
  try {
    const response = await apiClient.post("/orchestrator/chat", {
      message: userMessage,
      session_id: "default_session"
    });

    const finalResponse = response.data?.response || response.response || JSON.stringify(response);
    const citations = response.data?.citations || response.citations || [];

    // Simulate stream for frontend UX
    const words = finalResponse.split(' ');
    for (let i = 0; i < words.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 15));
      yield { token: (i === 0 ? '' : ' ') + words[i], done: false };
    }
    
    yield { token: '', done: true, citations };
  } catch (error) {
    console.error("Chat API error:", error);
    yield { token: "Error connecting to the LawGPT Orchestrator API.", done: true };
  }
}
