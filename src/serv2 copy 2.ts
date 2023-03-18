import "dotenv/config";
import { Configuration, OpenAIApi } from "openai";
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";

const configuration = new Configuration({
  apiKey: OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// async function queryTelegramLog(promptText: string) {
//   try {
//     const response = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         {
//           role: "system",
//           content: `The following is a log of a Telegram chat. Interpret the messages and respond accordingly.\n\n${promptText}\n\n[ChatGPT]:`,
//         },
//       ],
//     });
//     const message = response.choices[0].text.trim();
//     return message;
//   } catch (error) {
//     console.error("Error querying GPT-3.5-turbo:", error);
//     return null;
//   }
// }

// Example usage:
const telegramLog = `
[user1]: бот, как дела?
[user2]: AI, чё ваще?
`;

const openaiRequest = async (promptText: string): Promise<string> => {
  try {
    const content = `There's a log of a Telegram chat in the form of [username]:message (including your messages noted as [ChatGPT]).
    Check if there are any messages addressed to you (any form, any language, e.g AI, bot, etc) and that were not replied by you.
    If so, reply me with message, and mention the username of the person in you reply.
    If not, just reply me with "skip". This is the log (usernames and their messages):
              
              \n\n${promptText}\n\n`;

    console.log(content);

    const completion = await openai.createCompletion({
      model: "gpt-3.5-turbo",
      prompt: content,
      max_tokens: 1000,
      temperature: 0,
    });

    console.log(completion.data.choices[0].text);

    // const generatedText = completion.data.choices[0].message?.content || "";

    return ""; //generatedText.trim();
  } catch (error) {
    console.error("Error with OpenAI API:", error);
    return "Error processing your request. Please try again later.";
  }
};

openaiRequest(telegramLog)
  .then((response) => console.log("AI response:", response))
  .catch((error) => console.error("Error:", error));
