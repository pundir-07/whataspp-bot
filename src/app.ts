import express, { Request, Response } from "express";
import dotenv from "dotenv";
dotenv.config();

import * as whatsappService from "./services/whatsapp.service.js";
import { parseWebhook } from "./utils.js";

const app = express();

app.use(express.json());

app.get("/webhook", (req: Request, res: Response) => {
    console.log("ENV token :", process.env.VERIFY_TOKEN);
    console.log("Received request queries:", req.query);
    const mode = req.query["hub.mode"];
    const challenge = req.query["hub.challenge"];
    const token = req.query["hub.verify_token"];
    if (mode === "subscribe" && token === process.env.VERIFY_TOKEN) {
        console.log("Webhook verified!");
        return res.status(200).send(challenge);
    }

    console.log("Verification failed");
    res.sendStatus(403);
});

app.post("/webhook", async (req: Request, res: Response) => {
    try {
        const webhook = parseWebhook(req.body, false, true);
        await whatsappService.handleIncomingMessage(webhook);
    } catch (error) {
        console.log("Error in /webhook: ", error);
    } finally {
        res.sendStatus(200);
    }
});
export default app;
