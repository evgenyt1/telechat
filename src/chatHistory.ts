// export interface ChatMessage {
//   role: "user" | "assistant";
//   content: string;
//   username?: string;
// }

class ChatHistory {
  private history: Map<number, string[]> = new Map();

  addMessage(chatId: number, message: string) {
    if (!this.history.has(chatId)) {
      this.history.set(chatId, []);
    }
    this.history.get(chatId)?.push(message);
  }

  getRecentMessages(chatId: number, count: number): string[] {
    const messages = this.history.get(chatId) || [];
    return messages.slice(-count);
  }
}

export const chatHistory = new ChatHistory();
