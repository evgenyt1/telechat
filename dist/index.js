"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const telegraf_1 = require("telegraf");
const openai_1 = require("openai");
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || "";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const YOUR_USERNAME = process.env.YOUR_USERNAME || "";
if (!TELEGRAM_BOT_TOKEN || !OPENAI_API_KEY || !YOUR_USERNAME) {
    console.error("Error: Required environment variables are not set. Please check your .env file.");
    process.exit(1);
}
const bot = new telegraf_1.Telegraf(TELEGRAM_BOT_TOKEN);
let botUsername = "";
bot.telegram.getMe().then((botInfo) => {
    botUsername = botInfo.username;
});
const configuration = new openai_1.Configuration({
    apiKey: OPENAI_API_KEY,
});
const openai = new openai_1.OpenAIApi(configuration);
const openaiRequest = (input) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const completion = yield openai.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: input }],
        });
        const generatedText = ((_a = completion.data.choices[0].message) === null || _a === void 0 ? void 0 : _a.content) || "";
        return generatedText.trim();
    }
    catch (error) {
        console.error("Error with OpenAI API:", error);
        return "Error processing your request. Please try again later.";
    }
});
bot.start((ctx) => ctx.reply("Welcome to the ChatGPT Bot! To interact with me in a group chat, make sure to reply to one of your own messages, and I will respond."));
bot.on("text", (ctx) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c, _d;
    const input = ctx.message.text;
    const username = (_b = ctx.message.from) === null || _b === void 0 ? void 0 : _b.username;
    const isReply = ctx.message.reply_to_message;
    const isReplyToBotMessage = isReply && ((_d = (_c = ctx.message.reply_to_message) === null || _c === void 0 ? void 0 : _c.from) === null || _d === void 0 ? void 0 : _d.username) === botUsername;
    const isMentioned = input.includes(`@${botUsername}`);
    console.log("all", input, username, isReply, isReplyToBotMessage, isMentioned);
    if (isMentioned || isReplyToBotMessage) {
        const response = yield openaiRequest("отвечай как ватник и с матерком и юморком по-русски:\n\n" + input);
        ctx.reply(response);
    }
}));
bot.launch();
