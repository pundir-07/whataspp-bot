"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const app_js_1 = __importDefault(require("../src/app.js"));
describe("GET /webhook", () => {
    it("should return 403 when verification query parameters are missing", async () => {
        const response = await (0, supertest_1.default)(app_js_1.default)
            .get("/webhook");
        expect(response.status).toBe(403);
    });
    it("should return 200 when verification query parameters are valid", async () => {
        const response = await (0, supertest_1.default)(app_js_1.default)
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
