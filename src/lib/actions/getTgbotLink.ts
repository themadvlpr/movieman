"use server"
import { generateCryptoRandomString } from "@/lib/crypt/crypt-utils";

export async function getBotLink(userId: string) {
    return `https://t.me/${process.env.TELEGRAM_BOT_NAME}?start=${generateCryptoRandomString(userId)}`;
}