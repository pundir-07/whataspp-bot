require("dotenv").config();

async function sendTextMessage(recipientNumber,messageText) {
    const url = `https://graph.facebook.com/v25.0/${process.env.PHONE_NUMBER_ID_RONGTA}/messages`;

    const body = {
        messaging_product: "whatsapp",
        to: recipientNumber,
        type: "text",
        text:{
            body:messageText
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
}
module.exports= {sendTextMessage}