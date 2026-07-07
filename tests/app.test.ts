import request from "supertest";
import app from "../src/app.js";

describe("GET /webhook", () => {
    it("should return 403 when verification query parameters are missing", async () => {
        const response = await request(app)
            .get("/webhook");
        expect(response.status).toBe(403);
    });

    it("should return 200 when verification query parameters are valid", async () => {
        const response = await request(app)
            .get("/webhook")
            .query({
                "hub.mode": "subscribe",
                "hub.verify_token": process.env.VERIFY_TOKEN,
                "hub.challenge": "12345"
            });
        expect(response.status).toBe(200);
        expect(response.text).toBe("12345");
    });
});
