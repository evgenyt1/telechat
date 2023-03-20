import "dotenv/config";
import { Telegraf } from "telegraf";
import { Configuration, OpenAIApi } from "openai";
import fs from "fs/promises";
// import os from "os";
import { createServer } from "http";

// const networkInterfaces = os.networkInterfaces();
// const defaultInterface = networkInterfaces[Object.keys(networkInterfaces)[0]];

// const defaultIpv4Address = defaultInterface?.find(
//   (iface) => iface.family === "IPv4"
// )?.address;

// console.log(defaultIpv4Address);

console.log("ENV:", process.env);

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

const openaiRequest = async (input: string): Promise<string> => {
  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: input }],
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

const loadPromptFromFile = async () => {
  try {
    const data = await fs.readFile("prompt.txt", "utf-8");
    prompt = data;
  } catch (error) {
    console.error("Error loading prompt:", error);
  }
};

const savePromptToFile = async (newPrompt: string) => {
  try {
    await fs.writeFile("prompt.txt", newPrompt, "utf-8");
  } catch (error) {
    console.error("Error saving prompt:", error);
  }
};

loadPromptFromFile();

bot.on("text", async (ctx) => {
  const input = ctx.message.text;
  const username = ctx.message.from?.username;
  const isReply = ctx.message.reply_to_message;
  const isReplyToBotMessage =
    isReply && ctx.message.reply_to_message?.from?.username === botUsername;
  const isMentioned = input.includes(`@${botUsername}`);

  console.log(
    "all",
    input,
    username,
    isReply,
    isReplyToBotMessage,
    isMentioned
  );

  if (input.startsWith("prompt:")) {
    prompt = input.replace("prompt:", "").trim();
    savePromptToFile(prompt);
    ctx.reply("Prompt set!");
    return;
  }

  if (isMentioned || isReplyToBotMessage) {
    const response = await openaiRequest(prompt + ":\n\n" + input);
    ctx.reply(response);
  }
});

// bot.launch({
//   webhook: {
//     domain: process.env.HEROKU_URL!,
//     port: Number(process.env.PORT),
//   },
// });

if (process.env.PORT && process.env.HEROKU_DOMAIN) {
  bot.createWebhook({ domain: "HEROKU_DOMAIN" }).then((webhookInfo) => {
    createServer(webhookInfo).listen(process.env.PORT);
  });
} else bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
