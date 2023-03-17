import "dotenv/config";
import { Telegraf } from "telegraf";
import axios from "axios";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const YOUR_USERNAME = process.env.YOUR_USERNAME || "";

const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

const openaiRequest = async (input: string): Promise<string> => {
  const apiUrl = "https://api.openai.com/v1/engines/davinci-codex/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  };
  const data = {
    prompt: input,
    max_tokens: 50,
    n: 1,
    stop: null,
    temperature: 0.7,
  };

  try {
    const response = await axios.post(apiUrl, data, { headers });
    const generatedText = response.data.choices[0].text;
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

bot.on("text", async (ctx) => {
  const input = ctx.message.text;
  const username = ctx.message.from.username;
  const isReply = ctx.message.reply_to_message;
  const isReplyToYourMessage =
    isReply && ctx.message.reply_to_message.from.username === YOUR_USERNAME;

  if (username === YOUR_USERNAME || isReplyToYourMessage) {
    const response = await openaiRequest(input);
    ctx.reply(response);
  }
});

bot.launch();
