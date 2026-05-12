// //  each time i need to update webhook (for local development)
// // i need to run: "npm run dev"
// // then in new terminal run: "ngrok http 3000" and get new url
// // and update webhook url in telegram 
// // https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<YOUR_URL>/api/bot

// instead of all this i can use this script
// it automatically updates webhook
// npm run dev
// ngrok http 3000
// npm run webhook <ngrok_url>

import { webhookCallback } from "grammy";
import { bot } from "@/bot/core";

export const dynamic = 'force-dynamic';

export const POST = async (req: Request) => {
    if (!process.env.TELEGRAM_BOT_TOKEN) {
        return new Response("Bot token is missing", { status: 500 });
    }

    return webhookCallback(bot, "std/http")(req);
};