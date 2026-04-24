import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getDiscoverMedia } from "@/lib/tmdb/getDiscoverMedia";

function tmdbLang(lang: string) {
    return lang === "ru" ? "ru-RU" : lang === "uk" ? "uk-UA" : "en-US";
}

function isPhotoMessage(ctx: MyContext) {
    return !!ctx.callbackQuery?.message?.photo;
}

async function sendOrEditText(ctx: MyContext, text: string, extra: any) {
    if (isPhotoMessage(ctx)) {
        try { await ctx.deleteMessage(); } catch { /* ignore */ }
        await ctx.reply(text, extra);
    } else if (ctx.callbackQuery) {
        await ctx.editMessageText(text, extra);
    } else {
        await ctx.reply(text, extra);
    }
}

function escapeMarkdown(text: string) {
    return text.replace(/[_*`[\]]/g, "\\$&");
}

// ─── DISCOVER COMMAND ──────────────────────────────────────────────────────

export async function discoverCommand(ctx: MyContext) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    const keyboard = new InlineKeyboard()
        .text(t.movies, "disc_type_movie")
        .text(t.tv_shows, "disc_type_tv");

    await sendOrEditText(ctx, t.discover_title, { reply_markup: keyboard });
}

// ─── GENRE LIST ────────────────────────────────────────────────────────────

export async function showGenres(ctx: MyContext, type: "movie" | "tv") {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const tLang = tmdbLang(lang);

    const genreEndpoint = type === "movie" ? "/genre/movie/list" : "/genre/tv/list";
    const data = await tmdbFetch(genreEndpoint, { language: tLang }, CacheConfig.STATIC);

    if (!data?.genres?.length) {
        await ctx.reply(t.error);
        return;
    }

    const keyboard = new InlineKeyboard();
    data.genres.forEach((genre: { id: number; name: string }, i: number) => {
        keyboard.text(genre.name, `disc_g_${type}_${genre.id}`);
        if ((i + 1) % 2 === 0) keyboard.row();
    });
    keyboard.row().text(t.Back, "disc_start");

    await sendOrEditText(ctx, t.select_genre, { reply_markup: keyboard });
}

// ─── CARD VIEW ─────────────────────────────────────────────────────────────

export async function showDiscoveryResults(
    ctx: MyContext,
    type: "movie" | "tv",
    genreId: string,
    page = 1,
    index = 0
) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const tLang = tmdbLang(lang);
    const userId = ctx.user?.id;

    const data = await getDiscoverMedia(type, genreId, userId, String(page), tLang);

    if (!data.results?.length) {
        await ctx.reply(t.empty_results);
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

    const caption =
        `*${escapeMarkdown(item.title)}* (${year})${taglineStr}\n\n` +
        `🎭 *${t.genres}:* ${genresStr}\n` +
        `📊 *TMDB:* ${rating}` +
        userRating +
        `\n\n_(${safeIndex + 1}/${total})_`;

    // ── Keyboard ───────────────────────────────────────────────────────────
    const keyboard = new InlineKeyboard();
    const navBase = `disc_r_${type}_${genreId}`;
    const actBase = `disc_a_${type}_${genreId}_${page}_${safeIndex}`;

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
            .text(st.isWishlist ? `📌 ${t.wishlist}` : `➕`, `${actBase}_wl`)
            .text(st.isFavorite ? `❤️ ${t.favorite}` : `🤍 `, `${actBase}_fav`);
    }

    // Toggle to list view  (disc_lv = list view)
    keyboard.row().text(`📋 ${t.list_view}`, `disc_lv_${type}_${genreId}_${page}`);
    // Back to genre list
    keyboard.row().text(t.Back, `disc_type_${type}`);

    const photo = item.poster || "https://placehold.co/500x750";

    try {
        if (isPhotoMessage(ctx)) {
            await ctx.editMessageMedia(
                { type: "photo", media: photo, caption, parse_mode: "Markdown" },
                { reply_markup: keyboard }
            );
        } else {
            if (ctx.callbackQuery) {
                try { await ctx.deleteMessage(); } catch { /* ignore */ }
            }
            await ctx.replyWithPhoto(photo, {
                caption,
                parse_mode: "Markdown",
                reply_markup: keyboard,
            });
        }
    } catch (err) {
        console.error("showDiscoveryResults error:", err);
    }
}

// ─── LIST VIEW ─────────────────────────────────────────────────────────────

export async function showListView(
    ctx: MyContext,
    type: "movie" | "tv",
    genreId: string,
    page = 1
) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const tLang = tmdbLang(lang);
    const userId = ctx.user?.id;

    const data = await getDiscoverMedia(type, genreId, userId, String(page), tLang);

    if (!data.results?.length) {
        await ctx.reply(t.empty_results);
        return;
    }

    const totalPages = data.total_pages ?? 1;

    // ── Plain Markdown list (no MarkdownV2 — avoids escaping issues with titles) ──
    // const lines = data.results.map((item: any, i: number) => {
    //     const num = (page - 1) * 10 + i + 1;
    //     const year = item.release_year || "";
    //     // escapeMarkdown only escapes _ * ` [ ] for safe Markdown v1
    //     return `${num}. *${escapeMarkdown(item.title)}* (${year})`;
    // });

    const icon = type === "movie" ? "🎬" : "📺";
    const header = `${icon} *${t.list_view} ${type === "movie" ?
        t.genre_movies : t.genre_tv_shows}*\n${t.genre}: ${t[genreId as keyof typeof t]}\n\n${t.page} ${page}/${totalPages}`;
    // const listText = header + lines.join("\n");
    const listText = header;

    // ── Keyboard: each item taps to card view ──────────────────────────────
    const keyboard = new InlineKeyboard();

    data.results.forEach((item: any, i: number) => {
        const num = (page - 1) * 20 + i + 1;
        const year = item.release_year || "—";
        const label = `${num}. ${item.title} (${year})`;
        keyboard.text(label, `disc_r_${type}_${genreId}_${page}_${i}`).row();
    });

    // Toggle to card view + page navigation
    keyboard.text(`🃏 ${t.card_view}`, `disc_r_${type}_${genreId}_${page}_0`).row();

    if (page > 1) keyboard.text("⬅️", `disc_lv_${type}_${genreId}_${page - 1}`);
    if (totalPages > page) keyboard.text("➡️", `disc_lv_${type}_${genreId}_${page + 1}`);

    keyboard.row().text(t.Back, `disc_type_${type}`);

    await sendOrEditText(ctx, listText, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
    });
}