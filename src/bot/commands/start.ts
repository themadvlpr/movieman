import { decodeCryptoString } from "@/lib/crypt/crypt-utils";
import prisma from "@/lib/prisma";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function startCommand(ctx: MyContext) {
    const telegramId = ctx.from?.id.toString();
    const cryptoString = ctx.match;

    const lang = (ctx.user?.language as Language) || (ctx.from?.language_code as Language) || "en";
    const t = locales[lang] || locales.en;

    if (ctx.user) {
        return ctx.reply(
            t.welcome_back.replace("{name}", ctx.user.name || "Cinema Fan"),
            { parse_mode: "Markdown" }
        );
    }

    if (!cryptoString) {
        return ctx.reply(t.welcome_new, { parse_mode: "Markdown" });
    }

    const userId = decodeCryptoString(cryptoString as string);
    if (!userId) return ctx.reply("❌ Error: invalid link");

    try {
        if (!telegramId) return ctx.reply("Failed to determine your Telegram ID.");

        // first of all unlink from telegram all users
        await prisma.user.updateMany({
            where: { telegramId },
            data: { telegramId: null }
        });

        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                telegramId,
                language: lang
            }
        });

        await ctx.reply(t.link_success.replace("{name}", user.name || ""));
    } catch (error) {
        console.error(error);
        await ctx.reply(t.error);
    }
}