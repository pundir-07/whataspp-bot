import * as messageRepository from "../respositories/message.repository.js";
import * as userRepository from "../respositories/user.repository.js";
import { MESSAGE_TYPES } from "../constants/message-types.js";
import { ParsedWebhook } from "../utils.js";
import {  createCompletion } from "./openai.service.js";
import { systemPrompt } from "../lib/prompts/system.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

export async function handleIncomingMessage(webhook: ParsedWebhook): Promise<void> {
    const waId = webhook.waId;
    if (!waId) return;
    
    const user = await userRepository.findByWaId(waId);
    if (user) {
        console.log("User already exists");
    } else {
        if (webhook.profileName) {
            console.log("Creating new user entry in the db");
            await userRepository.upsert(waId, webhook.profileName);
        }
    }
    const message = webhook.message;
    const status = webhook.status;
    
    // If message is of type text upsert it in the database
    if (message && message.type === "text") {
        const messageDTO = createMessageDTO(webhook);
        await messageRepository.upsertMessage(waId, messageDTO);
    } 
    // Right now we are considering that only two types of incoming data- message or status
    else if (status)
    {
        await messageRepository.updateMessageStatus(status.id, status.status);
    }

    const messageText = webhook.message?.text;

    // Generate AI response and respond to the user
    if (waId && webhook.message?.type === MESSAGE_TYPES.TEXT && messageText) {
        await sendTypingIndicator(webhook.message.id);
        const allMessages = await messageRepository.findAllMessagesByWaId(waId)
        const compiledMessages= complieMessagesForAI(allMessages)
        console.log("All messages: ",compiledMessages)
        const response =await createCompletion([{role:"system",content:systemPrompt},...compiledMessages])
        const responseText = response.choices[0].message.content ?? "AI fat gya bc";
        const responseMetaMessageId = await sendTextMessage(waId, responseText);
        await messageRepository.upsertMessage(waId,{
            metaMessageId:responseMetaMessageId,
            type:'text',
            content:responseText,
            sentAt:new Date(),
            direction:"outgoing"
        })
    }
}
function complieMessagesForAI(messages:messageRepository.Message[]): ChatCompletionMessageParam[]{
    return messages.sort((a,b)=>{
        const timestampA= (new Date(a.sent_at)).getTime()
        const timestampB= (new Date(b.sent_at)).getTime()
        return timestampA-timestampB
    }).map((message)=>{
        return {
            role: (message.direction === "incoming" ? "user" : "assistant") as "user" | "assistant",
            content: typeof message.content === "string" ? message.content : ""
        } as ChatCompletionMessageParam;
    })
}

function createMessageDTO(data: ParsedWebhook | any,): messageRepository.MessageDTO {
    return {
        metaMessageId: data.message.id,
        type: data.message.type,
        content: data.message.text ?? null,
        direction:data.direction ??null,
        sentAt: new Date(Number(data.message.timestamp) * 1000)
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

export async function sendTextMessage(recipientNumber: string, messageText: string): Promise<string> {
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
    console.log(data);
    return data.messages[0].id
}
