import { Bot, Context } from "grammy";
import { authMiddleware } from "@/bot/middleware/auth";
import { startCommand } from "@/bot/commands/start";
import { discoverCommand, showGenres, showDiscoveryResults } from "@/bot/commands/discover";
import { discoverOldCommand } from "@/bot/commands/discover_old";
import { languageCommand } from "@/bot/commands/language";
import { libraryCommand } from "@/bot/commands/library";
import { User } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { locales, Language } from "@/bot/locales";
import { InlineKeyboard } from "grammy";
import { toggleMediaStatus } from "@/lib/db/media";
import { getDiscoverMedia } from "@/lib/tmdb/getDiscoverMedia";


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
bot.command("language", languageCommand);
bot.command("library", libraryCommand);
bot.command("discover", discoverCommand);
bot.command("discover_old", discoverOldCommand);

// ─── Helper: answer immediately to avoid Telegram's 10s timeout ────────────
function ack(ctx: MyContext, text?: string) {
    ctx.answerCallbackQuery(text).catch(() => {});
}

// ─── Legacy discover_old ───────────────────────────────────────────────────
bot.callbackQuery(/^discold_/, async (ctx: MyContext) => {
    ack(ctx);
    await discoverOldCommand(ctx);
});

// ─── Language selection ────────────────────────────────────────────────────
bot.callbackQuery(/set_lang_(.+)/, async (ctx: MyContext) => {
    const newLang = ctx?.match?.[1] as Language;
    const t = locales[newLang] || locales.en;
    ack(ctx);

    try {
        if (ctx.user) {
            await prisma.user.update({
                where: { id: ctx.user.id },
                data: { language: newLang },
            });
        }
        ctx.language = newLang;
        await ctx.editMessageText(t.lang_updated);
    } catch (error) {
        console.error("Language Callback Error:", error);
    }
});

// ─── DISCOVER FLOW ─────────────────────────────────────────────────────────

// disc_start → show type selection
bot.callbackQuery("disc_start", async (ctx: MyContext) => {
    ack(ctx);
    await discoverCommand(ctx);
});

// disc_type_{movie|tv} → show genres
// Called from photo message (back button from results), so showGenres handles deletion
bot.callbackQuery(/^disc_type_(movie|tv)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    ack(ctx);
    await showGenres(ctx, type);
});

// disc_g_{movie|tv}_{genreId} → show first result
bot.callbackQuery(/^disc_g_(movie|tv)_(\d+)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    const genreId = ctx.match![2];
    ack(ctx);
    await showDiscoveryResults(ctx, type, genreId, 1, 0);
});

// disc_r_{movie|tv}_{genreId}_{page}_{index} → navigate results
bot.callbackQuery(/^disc_r_(movie|tv)_(\d+)_(\d+)_(\d+)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    const genreId = ctx.match![2];
    const page = parseInt(ctx.match![3]);
    const index = parseInt(ctx.match![4]);
    ack(ctx);
    await showDiscoveryResults(ctx, type, genreId, page, index);
});

// disc_a_{movie|tv}_{genreId}_{page}_{index}_{action} → toggle status
// action codes: w=isWatched, wl=isWishlist, fav=isFavorite
bot.callbackQuery(/^disc_a_(movie|tv)_(\d+)_(\d+)_(\d+)_(w|wl|fav)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    const genreId = ctx.match![2];
    const page = parseInt(ctx.match![3]);
    const index = parseInt(ctx.match![4]);
    const actionCode = ctx.match![5];
    const userId = ctx.user?.id;

    if (!userId) {
        return ack(ctx, "⚠️ Link your account first");
    }

    const actionMap: Record<string, string> = {
        w: "isWatched",
        wl: "isWishlist",
        fav: "isFavorite",
    };
    const action = actionMap[actionCode];

    // Answer immediately — DB + TMDB calls below will take time
    ack(ctx, "⏳");

    try {
        const tLang = ctx.language === "ru" ? "ru-RU" : ctx.language === "uk" ? "uk-UA" : "en-US";
        const data = await getDiscoverMedia(type, genreId, userId, String(page), tLang);
        const item = data.results?.[index];

        if (!item) return;

        await toggleMediaStatus(userId, item.id, action, type);

        // Refresh the message to show updated status buttons
        await showDiscoveryResults(ctx, type, genreId, page, index);
    } catch (err) {
        console.error("Discovery action error:", err);
    }
});

// ─── LIBRARY ───────────────────────────────────────────────────────────────

bot.callbackQuery("lib_main", async (ctx: MyContext) => {
    ack(ctx);
    const user = ctx.user;
    const keyboard = new InlineKeyboard()
        .text("✅ Watched", "lib_watched")
        .text("⏳ Plan", "lib_plan").row()
        .text("⭐ Favorites", "lib_favs")
        .text("📊 Stats", "lib_stats");

    await ctx.editMessageText(`📂 *${user?.name}'s Library*`, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    });
});

bot.callbackQuery(/^lib_(.+)$/, async (ctx: MyContext) => {
    const category = ctx.match?.[1];
    const userId = ctx.user?.id;
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    if (!userId) return ack(ctx, "Error: User not found");

    ack(ctx);

    try {
        let text = "";

        switch (category) {
            case "watched": {
                const count = await prisma.userMedia.count({ where: { userId, isWatched: true } });
                text = t.watched_count?.replace("{watchedCount}", count.toString()) || `✅ Watched: ${count}`;
                break;
            }
            case "plan": {
                const count = await prisma.userMedia.count({ where: { userId, isWishlist: true } });
                text = t.plan_count?.replace("{planCount}", count.toString()) || `⏳ Plan: ${count}`;
                break;
            }
            case "favs": {
                const count = await prisma.userMedia.count({ where: { userId, isFavorite: true } });
                text = t.favs_count?.replace("{favsCount}", count.toString()) || `⭐ Favorites: ${count}`;
                break;
            }
            case "stats": {
                const total = await prisma.userMedia.count({ where: { userId } });
                text = t.total_count?.replace("{total}", total.toString()) || `📊 Total: ${total}`;
                break;
            }
            default:
                text = "Unknown category";
        }

        await ctx.editMessageText(text, {
            parse_mode: "Markdown",
            reply_markup: new InlineKeyboard().text(t.Back || "Back", "lib_main"),
        });

    } catch (error) {
        console.error("Library Callback Error:", error);
        await ctx.reply("Error updating message. Please try again.");
    }
});

// ─── Fallback ──────────────────────────────────────────────────────────────
bot.on("message:text", (ctx) => {
    if (ctx.message.text === "kek") return ctx.reply("kekiwe");
    ctx.reply(`You wrote: ${ctx.message.text}`);
});
