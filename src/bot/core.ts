import { Bot, Context } from "grammy";
import { authMiddleware } from "@/bot/middleware/auth";
import { startCommand } from "@/bot/commands/start";
import { discoverCommand } from "@/bot/commands/discover";
import { languageCommand } from "@/bot/commands/language";
import { libraryCommand } from "@/bot/commands/library";
import { User } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { locales, Language } from "@/bot/locales";
import { InlineKeyboard } from "grammy";


const token = process.env.TELEGRAM_BOT_TOKEN!;
export const bot = new Bot<Context>(token);

export type MyContext = Context & {
    user?: User;
    language?: string;
};
// apply middleware
bot.use(authMiddleware);

// register commands
bot.command("start", startCommand);
bot.command("discover", discoverCommand);
bot.command("language", languageCommand);
bot.command("library", libraryCommand);


// src/bot/core.ts

bot.callbackQuery(/set_lang_(.+)/, async (ctx: MyContext) => {
    const newLang = ctx?.match?.[1] as Language;
    const t = locales[newLang] || locales.en;

    try {
        await ctx.answerCallbackQuery();

        if (ctx.user) {
            // Save to DB for registered users
            await prisma.user.update({
                where: { id: ctx.user.id },
                data: { language: newLang }
            });
        }

        // Update the context immediately so the next command knows the choice
        ctx.language = newLang;

        await ctx.editMessageText(t.lang_updated);
    } catch (error) {
        console.error("Callback Error:", error);
    }
});


bot.callbackQuery("lib_main", async (ctx: MyContext) => {
    await ctx.answerCallbackQuery();
    const user = ctx.user;
    const keyboard = new InlineKeyboard()
        .text("✅ Watched", "lib_watched")
        .text("⏳ Plan", "lib_plan").row()
        .text("⭐ Favorites", "lib_favs")
        .text("📊 Stats", "lib_stats");

    await ctx.editMessageText(`📂 *${user?.name}'s Library*`, {
        parse_mode: "Markdown",
        reply_markup: keyboard
    });
});

bot.callbackQuery(/^lib_(.+)$/, async (ctx: MyContext) => {
    const category = ctx.match?.[1];
    const userId = ctx.user?.id;
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    if (!userId) return ctx.answerCallbackQuery("Error: User not found");

    try {
        await ctx.answerCallbackQuery();

        let text = "";

        switch (category) {
            case "watched":
                const watchedCount = await prisma.userMedia.count({
                    where: { userId, isWatched: true }
                });
                text = t.watched_count?.replace("{watchedCount}", watchedCount.toString())
                    || `✅ Watched: ${watchedCount}`;
                break;

            case "plan":
                const planCount = await prisma.userMedia.count({
                    where: { userId, isWishlist: true }
                });
                text = t.plan_count?.replace("{planCount}", planCount.toString())
                    || `⏳ Plan to watch: ${planCount}`;
                break;

            case "favs":
                const favCount = await prisma.userMedia.count({
                    where: { userId, isFavorite: true }
                });
                text = t.favs_count?.replace("{favsCount}", favCount.toString())
                    || `⭐ Favorites: ${favCount}`;
                break;

            case "stats":
                const total = await prisma.userMedia.count({ where: { userId } });
                text = t.total_count?.replace("{total}", total.toString())
                    || `📊 Total: ${total}`;
                break;

            default:
                text = "Unknown category";
        }

        if (!text.trim()) {
            text = "Data is currently unavailable.";
        }

        await ctx.editMessageText(text, {
            parse_mode: "Markdown",
            reply_markup: new InlineKeyboard().text(t.Back || "Back", "lib_main")
        });

    } catch (error) {
        console.error("Library Callback Error:", error);
        await ctx.reply("Error updating message. Please try again.");
    }
});




bot.on("message:text", (ctx) => {
    if (ctx.message.text === "kek") return ctx.reply("kekiwe");
    ctx.reply(`You wrote: ${ctx.message.text}`);
});

