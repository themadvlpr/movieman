import { Bot, Context, session, SessionFlavor } from "grammy";
import { authMiddleware } from "@/bot/middleware/auth";
import { startCommand } from "@/bot/commands/start";
import { discoverCommand, showGenres, showDiscoveryResults, showListView } from "@/bot/commands/discover";
import { searchCommand, showSearchResults, showSearchListView } from "@/bot/commands/search";
import { discoverOldCommand } from "@/bot/commands/discover_old";
import { languageCommand } from "@/bot/commands/language";
import { libraryCommand, showLibraryListView, showLibraryCard, libraryToggleAction, LibCat } from "@/bot/commands/library";
import { helpCommand } from "@/bot/commands/help";
import { User } from "@/lib/generated/prisma/client";
import prisma from "@/lib/prisma";
import { locales, Language } from "@/bot/locales";
import { toggleMediaStatus } from "@/lib/db/media";
import { getDiscoverMedia } from "@/lib/tmdb/getDiscoverMedia";
import { searchMedia } from "@/lib/tmdb/searchMedia";


interface SessionData {
    step: 'idle' | 'searching';
}

export type MyContext = Context & SessionFlavor<SessionData> & {
    user?: User;
    language?: string;
};

const token = process.env.TELEGRAM_BOT_TOKEN!;
export const bot = new Bot<MyContext>(token);

bot.use(session({
    initial: (): SessionData => ({ step: 'idle' })
}));

// apply middleware
bot.use(authMiddleware);

// register commands
bot.command("start", startCommand);
bot.command("language", languageCommand);
bot.command("library", libraryCommand);
bot.command("discover", discoverCommand);
bot.command("search", searchCommand);
bot.command("help", helpCommand);
bot.command("discover_old", discoverOldCommand);

// ─── Helper: answer immediately to avoid Telegram's 10s timeout ────────────
function ack(ctx: MyContext, text?: string) {
    ctx.answerCallbackQuery(text).catch(() => { });
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

// disc_r_{movie|tv}_{genreId}_{page}_{index} → navigate card results
bot.callbackQuery(/^disc_r_(movie|tv)_(\d+)_(\d+)_(\d+)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    const genreId = ctx.match![2];
    const page = parseInt(ctx.match![3]);
    const index = parseInt(ctx.match![4]);
    ack(ctx);
    await showDiscoveryResults(ctx, type, genreId, page, index);
});

// disc_lv_{movie|tv}_{genreId}_{page} → list view
bot.callbackQuery(/^disc_lv_(movie|tv)_(\d+)_(\d+)$/, async (ctx: MyContext) => {
    const type = ctx.match![1] as "movie" | "tv";
    const genreId = ctx.match![2];
    const page = parseInt(ctx.match![3]);
    ack(ctx);
    await showListView(ctx, type, genreId, page);
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

// ─── SEARCH FLOW ───────────────────────────────────────────────────────────

// srch_r_{queryB64}_{page}_{index} → navigate card search results
bot.callbackQuery(/^srch_r_([^_]+)_(\d+)_(\d+)$/, async (ctx: MyContext) => {
    const queryB64 = ctx.match![1];
    const page = parseInt(ctx.match![2]);
    const index = parseInt(ctx.match![3]);
    const query = Buffer.from(queryB64, "base64").toString("utf-8");
    ack(ctx);
    await showSearchResults(ctx, query, page, index);
});

// srch_lv_{queryB64}_{page} → search list view
bot.callbackQuery(/^srch_lv_([^_]+)_(\d+)$/, async (ctx: MyContext) => {
    const queryB64 = ctx.match![1];
    const page = parseInt(ctx.match![2]);
    const query = Buffer.from(queryB64, "base64").toString("utf-8");
    ack(ctx);
    await showSearchListView(ctx, query, page);
});

// srch_a_{queryB64}_{page}_{index}_{action} → toggle status for search item
bot.callbackQuery(/^srch_a_([^_]+)_(\d+)_(\d+)_(w|wl|fav)$/, async (ctx: MyContext) => {
    const queryB64 = ctx.match![1];
    const page = parseInt(ctx.match![2]);
    const index = parseInt(ctx.match![3]);
    const actionCode = ctx.match![4];
    const query = Buffer.from(queryB64, "base64").toString("utf-8");
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

    ack(ctx, "⏳");

    try {
        const tLang = ctx.language === "ru" ? "ru-RU" : ctx.language === "uk" ? "uk-UA" : "en-US";
        const data = await searchMedia(query, userId, String(page), tLang);
        const item = data.results?.[index];

        if (!item) return;

        await toggleMediaStatus(userId, item.id, action, item.type);

        // Refresh the message
        await showSearchResults(ctx, query, page, index);
    } catch (err) {
        console.error("Search action error:", err);
    }
});

// ─── LIBRARY FLOW ──────────────────────────────────────────────────────────

bot.callbackQuery("lib_main", async (ctx: MyContext) => {
    ack(ctx);
    await libraryCommand(ctx);
});

// lib_cat_{cat}_{page} → list view
bot.callbackQuery(/^lib_cat_(w|wl|fav)_(\d+)$/, async (ctx: MyContext) => {
    const cat = ctx.match![1] as LibCat;
    const page = parseInt(ctx.match![2]);
    ack(ctx);
    await showLibraryListView(ctx, cat, page);
});

// lib_c_{cat}_{page}_{index} → card view
bot.callbackQuery(/^lib_c_(w|wl|fav)_(\d+)_(\d+)$/, async (ctx: MyContext) => {
    const cat = ctx.match![1] as LibCat;
    const page = parseInt(ctx.match![2]);
    const index = parseInt(ctx.match![3]);
    ack(ctx);
    await showLibraryCard(ctx, cat, page, index);
});

// lib_a_{cat}_{page}_{index}_{action} → toggle action
bot.callbackQuery(/^lib_a_(w|wl|fav)_(\d+)_(\d+)_(w|wl|fav)$/, async (ctx: MyContext) => {
    const cat = ctx.match![1] as LibCat;
    const page = parseInt(ctx.match![2]);
    const index = parseInt(ctx.match![3]);
    const actionCode = ctx.match![4];
    ack(ctx);
    await libraryToggleAction(ctx, cat, page, index, actionCode);
});

// ─── Fallback ──────────────────────────────────────────────────────────────
bot.on("message:text", async (ctx: MyContext) => {

    const text = ctx.message?.text;
    if (!text) return;

    const lang = (ctx.user?.language || ctx.language) as Language || "en";
    const t = locales[lang];


    console.log("session step: ", ctx.session?.step);

    if (!text.startsWith("/") && ctx.session.step === 'searching') {
        console.log("search query: ", text);

        let query = text.trim();
        if (query.length > 30) query = query.substring(0, 30);

        await showSearchResults(ctx, query, 1, 0);
    } else {
        await ctx.reply(t.default_reply);
    }
});
