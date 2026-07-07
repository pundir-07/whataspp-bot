export const MESSAGE_TYPES = {
    TEXT: "text",
    IMAGE: "image",
    VIDEO: "video",
    AUDIO: "audio",
    DOCUMENT: "document",
    STICKER: "sticker",
    LOCATION: "location",
    CONTACTS: "contacts",
    INTERACTIVE: "interactive",
    BUTTON: "button",
    REACTION: "reaction",
    ORDER: "order",
    SYSTEM: "system",
    UNKNOWN: "unknown",
} as const;

export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES];

export default MESSAGE_TYPES;
