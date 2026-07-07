import * as messageRepository from "../respositories/message.repository.js";
import * as userRepository from "../respositories/user.repository.js";
import { MESSAGE_TYPES } from "../constants/message-types.js";
import { ParsedWebhook } from "../utils.js";
import { logger } from "../misc/logger.js";
import {  createCompletion } from "./openai.service.js";
import { systemPrompt } from "../lib/prompts/system.js";
export async function handleIncomingMessage(webhook: ParsedWebhook): Promise<void> {
    const waId = webhook.waId;
    if (!waId) return;

    const user = await userRepository.findByWaId(waId);
    if (user) {
        logger.log("User already exists");
    } else {
        if (webhook.profileName) {
            logger.log("Creating new user entry in the db");
            await userRepository.upsert(waId, webhook.profileName);
        }
    }
    const message = webhook.message;
    const status = webhook.status;
    
    if (message && message.type === "text") {
        const messageDTO = createMessageDTO(webhook);
        await messageRepository.upsertMessage(waId, messageDTO);
    } else if (status) {
        await messageRepository.updateMessageStatus(status.id, status.status);
    }

    const messageText = webhook.message?.text;

    // Echo the message text back to the user
    if (waId && webhook.message?.type === MESSAGE_TYPES.TEXT && messageText) {
        await sendTypingIndicator(webhook.message.id);
        const allMessages = await messageRepository.findAllMessagesByWaId(waId)
        const response =await createCompletion([{role:"system",content:systemPrompt},{role:"user",content:messageText}])
        const responseText = response.choices[0].message.content ?? "AI fat gya bc";
        await sendTextMessage(waId, responseText);
    }
}

function createMessageDTO(webhook: ParsedWebhook): messageRepository.MessageDTO {
    if (!webhook.message) {
        throw new Error("Cannot create message DTO without message payload");
    }
    return {
        metaMessageId: webhook.message.id,
        type: webhook.message.type,
        content: webhook.message.text ?? null,
        sentAt: webhook.message.timestamp
    };
}

export async function sendTypingIndicator(messageId: string): Promise<any> {
    const response = await fetch(
        `https://graph.facebook.com/v23.0/${process.env.PHONE_NUMBER_ID_RONGTA}/messages`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PERMANENT_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                messaging_product: "whatsapp",
                status: "read",
                message_id: messageId,
                typing_indicator: {
                    type: "text",
                },
            }),
        }
    );

    if (!response.ok) {
        throw new Error(await response.text());
    }

    return response.json();
}

export async function sendTextMessage(recipientNumber: string, messageText: string): Promise<void> {
    const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID_RONGTA}/messages`;

    const body = {
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "text",
        text: {
            body: messageText
        },
    };

    const response = await fetch(url, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${process.env.PERMANENT_ACCESS_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
    });

    const data = await response.json();
    logger.log(data);
}
