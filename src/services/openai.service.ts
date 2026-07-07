import OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/chat/completions";

const client = new OpenAI({
  apiKey: process.env.OPEN_ROUTER_API_KEY!,
  baseURL: "https://openrouter.ai/api/v1",
});

type CompletionOptions = Omit<
  ChatCompletionCreateParamsNonStreaming,
  "messages" | "model"
>;

export async function createCompletion(
  messages: ChatCompletionMessageParam[],
  options: CompletionOptions = {}
) {
  return client.chat.completions.create({
    model: "openrouter/free",
    messages,
    ...options,
  });
}