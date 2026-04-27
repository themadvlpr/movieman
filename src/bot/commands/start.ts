import { decodeCryptoString } from "@/lib/crypt/crypt-utils";
import prisma from "@/lib/prisma";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function startCommand(ctx: MyContext) {
    const telegramId = ctx.from?.id.toString();
    if (!telegramId) return;

    ctx.session.step = 'idle';

    const cryptoString = ctx.match;
    const lang = (ctx.user?.language as Language) || (ctx.from?.language_code as Language) || "en";
    const t = locales[lang] || locales.en;

    if (cryptoString) {
        const userIdFromSite = decodeCryptoString(cryptoString as string);
        if (!userIdFromSite) return ctx.reply("❌ Error: invalid link");

        try {
            const existingTgUser = await prisma.user.findUnique({
                where: { telegramId }
            });

            if (existingTgUser && existingTgUser.id !== userIdFromSite) {
                await prisma.user.delete({ where: { id: existingTgUser.id } });
            }

            const user = await prisma.user.update({
                where: { id: userIdFromSite },
                data: { telegramId, language: lang }
            });

            ctx.user = user;
            return await ctx.reply(t.link_success.replace("{name}", user.name || ""));
        } catch (error) {
            console.error("Link Error:", error);
            return await ctx.reply(t.error);
        }
    }

    if (ctx.user?.email) {
        return ctx.reply(
            t.welcome_back.replace("{name}", ctx.user.name || "Cinema Fan"),
            { parse_mode: "Markdown" }
        );
    }

    return ctx.reply(
        t.welcome_new.replace("{name}", ctx.from?.first_name || ""),
        { parse_mode: "Markdown" }
    );
}