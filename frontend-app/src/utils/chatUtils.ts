import { Citation, UploadedDocument } from '@/types/chat';
import { getMockAnswer } from '@/data/chatMocks';

export interface StreamChunk {
  token: string;
  done: boolean;
  citations?: Citation[];
}

// Simulates a token-by-token SSE stream from mock data. Swap this generator's
// body for a real fetch()-based reader against the chat-assistant API; callers
// only depend on the async-iterable StreamChunk shape, not the source.
export async function* streamMockResponse(
  userMessage: string,
  documents: UploadedDocument[] = []
): AsyncGenerator<StreamChunk> {
  const { response, citations } = getMockAnswer(userMessage);

  const prefix = documents.length > 0
    ? `Referencing ${documents.length} uploaded document(s). `
    : '';

  const fullText = prefix + response;
  const words = fullText.split(' ');

  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 18));
    yield { token: (i === 0 ? '' : ' ') + words[i], done: false };
  }

  yield { token: '', done: true, citations };
}
