import { NextFunction } from "grammy";
import { MyContext } from "@/bot/core";
import prisma from "@/lib/prisma";

export async function authMiddleware(ctx: MyContext, next: NextFunction) {
    try {
        const tgId = ctx.from?.id.toString();
        const telegramUsername = ctx.from?.username;

        if (tgId) {
            // Use upsert: if user does not exist — create, if exists — just get
            const user = await prisma.user.upsert({
                where: { telegramId: tgId },
                update: {}, // Don't change anything to avoid overwriting data from the site
                create: {
                    telegramId: tgId,
                    telegramUsername: telegramUsername,
                    name: ctx.from?.first_name || "Guest",
                    // Define language only on first creation
                    language: (ctx.from?.language_code === "ru" || ctx.from?.language_code === "uk")
                        ? ctx.from.language_code
                        : "en",
                }
            });

            ctx.user = user;
            ctx.language = user.language;
        }
    } catch (error) {
        console.error("Error in authMiddleware:", error);
        // If the database is down, let the bot respond on the default language
        if (!ctx.language) ctx.language = "en";
    }

    return await next();
}