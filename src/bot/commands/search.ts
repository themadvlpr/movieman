import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";
import { searchMedia } from "@/lib/tmdb/searchMedia";
import { InputFile } from "grammy";

function tmdbLang(lang: string) {
    return lang === "ru" ? "ru-RU" : lang === "uk" ? "uk-UA" : "en-US";
}

function isPhotoMessage(ctx: MyContext) {
    return !!ctx.callbackQuery?.message?.photo;
}

function truncate(str: string, limit: number) {
    const chars = [...str];
    if (chars.length <= limit) return str;
    return chars.slice(0, limit - 3).join("") + "...";
}

async function sendOrEditText(ctx: MyContext, text: string, extra: any) {
    if (isPhotoMessage(ctx)) {
        try { await ctx.deleteMessage(); } catch { /* ignore */ }
        await ctx.reply(text, extra);
    } else if (ctx.callbackQuery) {
        try {
            await ctx.editMessageText(text, extra);
        } catch (err: any) {
            if (!err.message?.includes("message is not modified")) {
                throw err;
            }
        }
    } else {
        await ctx.reply(text, extra);
    }
}

function escapeMarkdown(text: string) {
    return text.replace(/[_*`[\]]/g, "\\$&");
}

// ─── SEARCH COMMAND ──────────────────────────────────────────────────────────

export async function searchCommand(ctx: MyContext) {
    ctx.session.step = 'searching';

    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    // Get query from command arguments
    let query = (ctx.match as string)?.trim(); // get parameter after /search 

    if (!query || query.length === 0) {
        await ctx.reply(t.search_query_empty, { parse_mode: "Markdown" });
        return;
    }

    // Truncate query to 30 chars to ensure it fits in Telegram's 64-byte callback data limit
    if (query.length > 30) {
        query = query.substring(0, 30);
    }

    await showSearchResults(ctx, query, 1, 0);
}

// ─── CARD VIEW ─────────────────────────────────────────────────────────────

export async function showSearchResults(
    ctx: MyContext,
    query: string,
    page = 1,
    index = 0
) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const tLang = tmdbLang(lang);
    const userId = ctx.user?.id;

    const data = await searchMedia(query, userId, String(page), tLang);

    if (!data.results?.length) {
        await sendOrEditText(ctx, t.empty_results, {});
        return;
    }

    const total = data.results.length;
    const safeIndex = Math.max(0, Math.min(index, total - 1));
    const item = data.results[safeIndex];

    // ── Caption ────────────────────────────────────────────────────────────
    const genresStr = item.genre_names?.join(", ") || "—";
    const rating = item.vote_average ? `⭐ ${item.vote_average.toFixed(1)}/10` : "N/A";
    const year = item.release_year || "N/A";
    const taglineStr = item.tagline ? `\n_${escapeMarkdown(item.tagline)}_` : "";
    const userRating = item.initialDbState.userRating
        ? `\n🎯 *${t.rating}:* ${item.initialDbState.userRating}/10`
        : "";

    const typePath = item.type === "movie" ? "movies" : "tvseries";
    const linkUrl = `${process.env.BETTER_AUTH_URL}/${lang === 'uk' ? 'ua' : lang}/${typePath}/${item.id}`;
    const linkText = `🔗 [${t.view_on_site || "View on Website"}](${linkUrl})`;

    const titlePrefix = item.type === "movie" ? "🎬" : "📺";

    const caption =
        `${titlePrefix} *${escapeMarkdown(item.title)}* (${year})${taglineStr}\n\n` +
        `${genresStr && genresStr !== "—" ? `🎭 *${t.genres}:* ${genresStr}` : ""}\n` +
        `${rating && rating !== "N/A" ? `📊 *TMDB:* ${rating}` : ""}` +
        userRating +
        `\n_(${safeIndex + 1}/${total})_` +
        `\n\n${linkText}`;

    // ── Keyboard ───────────────────────────────────────────────────────────
    const keyboard = new InlineKeyboard();
    // Use base64 for query to avoid issues with special characters in callback data
    const queryB64 = Buffer.from(query).toString("base64");
    const navBase = `srch_r_${queryB64}`;
    const actBase = `srch_a_${queryB64}_${page}_${safeIndex}`;

    // Navigation row
    const hasPrev = safeIndex > 0 || page > 1;
    const hasNext = safeIndex < total - 1 || (data.total_pages ?? 1) > page;

    if (hasPrev) {
        const prevCb = safeIndex > 0
            ? `${navBase}_${page}_${safeIndex - 1}`
            : `${navBase}_${page - 1}_19`;
        keyboard.text("⬅️", prevCb);
    }
    if (hasNext) {
        const nextCb = safeIndex < total - 1
            ? `${navBase}_${page}_${safeIndex + 1}`
            : `${navBase}_${page + 1}_0`;
        keyboard.text("➡️", nextCb);
    }

    // Status buttons (only for linked accounts)
    if (ctx.user?.email) {
        const st = item.initialDbState;
        keyboard
            .row()
            .text(st.isWatched ? `✅ ${t.watched}` : `👀`, `${actBase}_w`)
            .text(st.isWishlist ? `📌 ${t.wishlist}` : `✍️`, `${actBase}_wl`)
            .text(st.isFavorite ? `❤️ ${t.favorite}` : `🤍 `, `${actBase}_fav`);
    }

    // Toggle to list view  (srch_lv = list view)
    keyboard.row().text(`📋 ${t.list_view}`, `srch_lv_${queryB64}_${page}`);

    const photo = item.poster || "https://placehold.co/500x750.png";
    console.log("poster", photo);
    console.log("caption", caption);

    if (process.env.NODE_ENV === "development") {
        console.log(`[Search] Showing item ${safeIndex + 1}/${total}. Photo: ${photo}`);
    }

    try {
        if (isPhotoMessage(ctx)) {
            try {
                await ctx.editMessageMedia(
                    {
                        type: "photo",
                        media: photo,
                        caption,
                        parse_mode: "Markdown"
                    },
                    { reply_markup: keyboard }
                );
            } catch (err: any) {
                if (err.message?.includes("message is not modified")) return;

                console.warn(`[Search] Edit failed, trying to send new message with InputFile...`);

                try { await ctx.deleteMessage(); } catch { }

                await ctx.replyWithPhoto(new InputFile({ url: photo }), {
                    caption,
                    parse_mode: "Markdown",
                    reply_markup: keyboard,
                });
            }
        } else {
            if (ctx.callbackQuery) {
                try { await ctx.deleteMessage(); } catch { }
            }

            try {

                await ctx.replyWithPhoto(new InputFile({ url: photo }), {
                    caption,
                    parse_mode: "Markdown",
                    reply_markup: keyboard,
                });
            } catch (sendErr) {
                await ctx.reply(caption, {
                    parse_mode: "Markdown",
                    reply_markup: keyboard,
                });
            }
        }
    } catch (err) {
        console.error("showSearchResults error:", err);
    }
}

// ─── LIST VIEW ─────────────────────────────────────────────────────────────

export async function showSearchListView(
    ctx: MyContext,
    query: string,
    page = 1
) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const tLang = tmdbLang(lang);
    const userId = ctx.user?.id;

    const data = await searchMedia(query, userId, String(page), tLang);

    if (!data.results?.length) {
        await sendOrEditText(ctx, t.empty_results, {});
        return;
    }

    const totalPages = data.total_pages ?? 1;
    const queryB64 = Buffer.from(query).toString("base64");

    const header = `🔍 *${t.search_title.replace("{query}", query)}*\n` +
        `_${t.page} (${page}/${totalPages})_`;

    const listText = `${header}`;

    // ── Keyboard: each item taps to card view ──────────────────────────────
    const keyboard = new InlineKeyboard();

    data.results.forEach((item: any, i: number) => {
        const num = (page - 1) * 20 + i + 1;
        const year = item.release_year || "—";
        const icon = item.type === "movie" ? "🎬" : "📺";
        const label = truncate(`${num}. ${icon} ${item.title} (${year})`, 40);
        keyboard.text(label, `srch_r_${queryB64}_${page}_${i}`).row();
    });

    // Toggle to card view + page navigation
    keyboard.text(`🃏 ${t.card_view}`, `srch_r_${queryB64}_${page}_0`).row();

    if (page > 1) keyboard.text("⬅️", `srch_lv_${queryB64}_${page - 1}`);
    if (totalPages > page) keyboard.text("➡️", `srch_lv_${queryB64}_${page + 1}`);

    await sendOrEditText(ctx, listText, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    });
}
