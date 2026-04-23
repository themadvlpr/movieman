// src/bot/middleware/auth.ts
import { NextFunction } from "grammy";
import { MyContext } from "@/bot/core";
import prisma from "@/lib/prisma";

export async function authMiddleware(ctx: MyContext, next: NextFunction) {
    try {
        if (ctx.from) {
            const user = await prisma.user.findUnique({
                where: { telegramId: ctx.from.id.toString() },
            });

            if (user) {
                ctx.user = user;
                // Priority 1: Language from Database
                ctx.language = user.language;
            } else {
                // Priority 2: Language from Telegram User Settings
                // If TG language is not supported, fallback to 'en'
                const tgLang = ctx.from.language_code;
                console.log("tgLang: ", tgLang);
                ctx.language = (tgLang === "ru" || tgLang === "uk") ? tgLang : "en";
            }
        }
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        ctx.language = "en"; // Final fallback
    }

    return await next();
}