import MESSAGE_TYPES from "../constants/message-types.js";
import textHandler from "../handlers/text.handler.js";
import imageHandler from "../handlers/image.handler.js";
import audioHandler from "../handlers/audio.handler.js";

type HandlerFunc = (message: any) => Promise<void> | void;

const handlers: Record<string, HandlerFunc> = {
    [MESSAGE_TYPES.TEXT]: textHandler,
    [MESSAGE_TYPES.IMAGE]: imageHandler,
    [MESSAGE_TYPES.AUDIO]: audioHandler,
};

export default async function dispatch(message: { type: string; [key: string]: any }): Promise<void> {
    const handler = handlers[message.type];

    if (!handler) {
        console.log(`Unsupported message type: ${message.type}`);
        return;
    }

    await handler(message);
}
