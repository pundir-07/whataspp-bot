const express = require("express")
require("dotenv").config()
const { sendTextMessage } = require("./message.js")
const { parseWebhook, logWebhook } = require("./utils.js")
const MESSAGE_TYPES = require("./constants/message-types.js")
const app = express()

const PORT = 3000

app.use(express.json())

app.get("/webhook", (req, res) => {
    console.log("ENV token :", process.env.VERIFY_TOKEN,)
    console.log("Received request queries:", req.query)
    const mode = req.query["hub.mode"]
    const challenge = req.query["hub.challenge"]
    const token = req.query["hub.verify_token"]
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("Webhook verified!");
        return res.status(200).send(challenge);
    }

    console.log("Verification failed");
    res.sendStatus(403);
})
app.post("/webhook",async (req, res) => {
    try {
        // console.log("Raw webhook body:",JSON.stringify(req.body,null,2))
        const webhook = parseWebhook(req.body)
        logWebhook(webhook)
        const wa_id = webhook.waId
        const text = webhook.message?.text
        if (wa_id && webhook.message?.type=== MESSAGE_TYPES.TEXT) {
           await sendTextMessage(wa_id,text)
        }
        
    } catch (error) {
        console.log("Caught Error: ",error)
    }finally{
        res.sendStatus(200);
    }
});
module.exports = app