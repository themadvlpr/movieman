// each time i need to update webhook for telegram bot (for local development)
// i need to run: "npm run dev"
// then in new terminal run: "ngrok http 3000" and get new url
// and update webhook url in telegram 
// https://api.telegram.org/bot<BOT_TOKEN>/setWebhook?url=<YOUR_URL>/api/bot

// instead of all this i can use this script
// it automatically updates webhook
// npm run dev
// ngrok http 3000
// npm run webhook ngrok_url


const token = process.env.TELEGRAM_BOT_TOKEN;
const url = process.argv[2];

if (!token) {
    console.error("❌ Error: TELEGRAM_BOT_TOKEN not found in .env");
    process.exit(1);
}

if (!url) {
    console.error("❌ Error: Please provide URL. Example: npm run webhook https://abc.ngrok.io");
    process.exit(1);
}

const webhookUrl = `${url}/api/bot`;

console.log(`📡 Setting webhook at: ${webhookUrl}...`);

const params = new URLSearchParams({
    url: webhookUrl,
    allowed_updates: JSON.stringify(["message", "callback_query"])
});

fetch(`https://api.telegram.org/bot${token}/setWebhook?${params.toString()}`)
    .then((res) => res.json())
    .then((data) => {
        if (data.ok) {
            console.log("✅ Success:", data.description);
            console.log("🛠 Updates allowed: message, callback_query");
        } else {
            console.error("❌ Telegram Error:", data);
        }
    })
    .catch((err) => console.error("❌ Network Error:", err));