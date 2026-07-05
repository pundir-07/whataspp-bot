// function parseWebhook(body) {
//     const entry = body.entry?.[0];
//     const change = entry?.changes?.[0];
//     const value = change?.value;
//     const message = value?.messages?.[0];
//     const contact = value?.contacts?.[0];

//     return {
//         // Event
//         object: body.object,
//         field: change?.field,

//         // Business metadata
//         businessPhoneNumber: value?.metadata?.display_phone_number,
//         phoneNumberId: value?.metadata?.phone_number_id,

//         // Sender
//         waId: contact?.wa_id,
//         userId: contact?.user_id,
//         profileName: contact?.profile?.name,

//         // Message
//         messageId: message?.id,
//         messageType: message?.type,
//         timestamp: message?.timestamp,
//         from: message?.from,
//         fromUserId: message?.from_user_id,

//         // Text
//         text: message?.text?.body,

//         // Media
//         image: message?.image,
//         video: message?.video,
//         audio: message?.audio,
//         document: message?.document,
//         sticker: message?.sticker,

//         // Interactive
//         button: message?.button,
//         interactive: message?.interactive,

//         // Location / Contacts
//         location: message?.location,
//         contacts: message?.contacts,

//         // Context (reply, forwarded, quoted, etc.)
//         context: message?.context,

//         // Referral / Ads
//         referral: message?.referral,

//         // Errors (rare)
//         errors: value?.errors
//     };
// }
function parseWebhook(body) {
    const entry = body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;

    const message = value?.messages?.[0];
    const status = value?.statuses?.[0];
    const contact = value?.contacts?.[0];

    return {
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
        errors: value.errors
    };
}
// logger/webhook.logger.js

function logWebhook(webhook) {
    console.log("\n========== Incoming Webhook ==========");

    if (webhook.message) {
        console.log(`Event        : MESSAGE`);
        console.log(`Type         : ${webhook.message.type}`);
        console.log(`WA ID        : ${webhook.waId}`);
        console.log(`Profile      : ${webhook.profileName}`);
        console.log(`Timestamp    : ${new Date(Number(webhook.message.timestamp) * 1000).toLocaleString()}`);

        if (webhook.message.type === "text") {
            console.log(`Text         : ${webhook.message.text}`);
        }
    }

    if (webhook.status) {
        console.log(`Event        : STATUS`);
        console.log(`Status       : ${webhook.status.status}`);
        console.log(`WA ID        : ${webhook.status.recipientId}`);
        console.log(`Timestamp    : ${new Date(Number(webhook.status.timestamp) * 1000).toLocaleString()}`);
    }

    if (webhook.errors?.length) {
        console.log("Errors:");
        webhook.errors.forEach((error, index) => {
            console.log(`  ${index + 1}. ${error.message || JSON.stringify(error)}`);
        });
    }

    console.log("======================================\n");
}

module.exports = logWebhook;

module.exports={parseWebhook,logWebhook}