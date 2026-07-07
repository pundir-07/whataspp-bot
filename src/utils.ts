
import { logger } from "./misc/logger";
export interface WebhookMessage {
    id: string;
    from: string;
    fromUserId?: string;
    type: string;
    timestamp: string | number;
    text?: string;
    image?: any;
    video?: any;
    audio?: any;
    document?: any;
    sticker?: any;
    location?: any;
    contacts?: any;
    interactive?: any;
    button?: any;
    reaction?: any;
    order?: any;
    system?: any;
    context?: any;
    referral?: any;
}

export interface WebhookStatus {
    id: string;
    recipientId: string;
    status: string;
    timestamp: string | number;
    conversation?: any;
    pricing?: any;
    errors?: any[];
}

export interface ParsedWebhook {
    object?: string;
    field?: string;
    businessPhoneNumber?: string;
    phoneNumberId?: string;
    waId?: string;
    userId?: string;
    profileName?: string;
    message: WebhookMessage | null;
    status: WebhookStatus | null;
    errors?: any[];
}

export function parseWebhook(body: any, log_raw?: boolean, log_parsed?: boolean): ParsedWebhook {
    if (log_raw) {
        logger.log(`==============RAW WEBHOOK BODY==============\n${JSON.stringify(body, null, 2)}\n=====================================`);
    }
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];
    const status = value?.statuses?.[0];
    const contact = value?.contacts?.[0];

    const parsedWebhook: ParsedWebhook = {
        // Event
        object: body.object,
        field: change?.field,

        // Business
        businessPhoneNumber: value?.metadata?.display_phone_number,
        phoneNumberId: value?.metadata?.phone_number_id,

        // Contact
        waId: contact?.wa_id,
        userId: contact?.user_id,
        profileName: contact?.profile?.name,

        // Incoming Message
        message: message
            ? {
                  id: message.id,
                  from: message.from,
                  fromUserId: message.from_user_id,
                  type: message.type,
                  timestamp: message.timestamp,

                  text: message.text?.body,

                  image: message.image,
                  video: message.video,
                  audio: message.audio,
                  document: message.document,
                  sticker: message.sticker,

                  location: message.location,
                  contacts: message.contacts,

                  interactive: message.interactive,
                  button: message.button,

                  reaction: message.reaction,
                  order: message.order,
                  system: message.system,

                  context: message.context,
                  referral: message.referral
              }
            : null,

        // Status Update
        status: status
            ? {
                  id: status.id,
                  recipientId: status.recipient_id,
                  status: status.status,
                  timestamp: status.timestamp,

                  conversation: status.conversation,
                  pricing: status.pricing,

                  errors: status.errors
              }
            : null,

        // Top-level errors
        errors: value?.errors
    };

    if (log_parsed) {
        logWebhook(parsedWebhook);
    }
    return parsedWebhook;
}

export function logWebhook(webhook: ParsedWebhook): void {
    logger.log("\n========== Incoming Webhook ==========");

    if (webhook.message) {
        logger.log(`Event        : MESSAGE`);
        logger.log(`Type         : ${webhook.message.type}`);
        logger.log(`WA ID        : ${webhook.waId}`);
        logger.log(`Profile      : ${webhook.profileName}`);
        logger.log(`Timestamp    : ${new Date(Number(webhook.message.timestamp) * 1000).toLocaleString()}`);

        if (webhook.message.type === "text") {
            logger.log(`Text         : ${webhook.message.text}`);
        }
    }

    if (webhook.status) {
        logger.log(`Event        : STATUS`);
        logger.log(`Status       : ${webhook.status.status}`);
        logger.log(`WA ID        : ${webhook.status.recipientId}`);
        logger.log(`Timestamp    : ${new Date(Number(webhook.status.timestamp) * 1000).toLocaleString()}`);
    }

    if (webhook.errors?.length) {
        logger.log("Errors:");
        webhook.errors.forEach((error, index) => {
            logger.log(`  ${index + 1}. ${error.message || JSON.stringify(error)}`);
        });
    }

    logger.log("======================================\n");
}
