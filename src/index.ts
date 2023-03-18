import "dotenv/config";
import { Telegraf } from "telegraf";
import { Configuration, OpenAIApi } from "openai";
import { ChatMessage, chatHistory } from "./chatHistory";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const YOUR_USERNAME = process.env.YOUR_USERNAME || "";

if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY || !YOUR_USERNAME) {
  console.error(
    "Error: Required environment variables are not set. Please check your .env file."
  );
  process.exit(1);
}

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

let botUsername = "";

bot.telegram.getMe().then((botInfo) => {
  botUsername = botInfo.username;
});

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const openaiRequest = async (
  messages: ChatMessage[],
  chatId: number
): Promise<string> => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: messages,
    });
    const generatedText = completion.data.choices[0].message?.content || "";

    return generatedText.trim();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "Error processing your request. Please try again later.";
  }
};

bot.start((ctx) =>
  ctx.reply(
    "Welcome to the ChatGPT Bot! To interact with me in a group chat, make sure to reply to one of your own messages, and I will respond."
  )
);

let prompt = "";

bot.on("text", async (ctx) => {
  const input = ctx.message.text;
  const chatId = ctx.message.chat.id;
  const username = ctx.message.from?.username || "Unknown";
  const isReply = ctx.message.reply_to_message;
  const isReplyToBotMessage =
    isReply && ctx.message.reply_to_message?.from?.username === botUsername;
  const isMentioned = input.includes(`@${botUsername}`);

  chatHistory.addMessage(chatId, {
    role: "user",
    content: input,
    username: username,
  });

  if (input.startsWith("prompt:")) {
    prompt = input.replace("prompt:", "");
    ctx.reply("Prompt set!");
    return;
  }

  if (isMentioned || isReplyToBotMessage) {
    const response = await openaiRequest(
      chatHistory.getRecentMessages(chatId, 5),
      chatId
    );
    ctx.reply(response);
    chatHistory.addMessage(chatId, { role: "assistant", content: response });
  }
});

bot.launch();
