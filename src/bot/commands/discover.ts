import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";
import { tmdbFetch, CacheConfig } from "@/lib/tmdb/tmdb-api";
import { getDiscoverMedia } from "@/lib/tmdb/getDiscoverMedia";

function tmdbLang(lang: string) {
    return lang === "ru" ? "ru-RU" : lang === "uk" ? "uk-UA" : "en-US";
}

/** Returns true if the current callback message contains a photo */
function isPhotoMessage(ctx: MyContext) {
    return !!ctx.callbackQuery?.message?.photo;
}

/**
 * Smart edit/reply helper:
 * - If current message is a photo → delete it, then send new text
 * - Otherwise → edit the text in-place
 */
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

export async function discoverCommand(ctx: MyContext) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    const keyboard = new InlineKeyboard()
        .text(t.movies, "disc_type_movie")
        .text(t.tv_shows, "disc_type_tv");

    await sendOrEditText(ctx, t.discover_title, { reply_markup: keyboard });
}

/**
 * Fetch genres from TMDB and display them as an inline keyboard.
 * Handles both text and photo message contexts (Back button from results).
 */
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

/**
 * Fetch and display a single media item (with poster photo).
 * Navigation: ⬅️ ➡️   Actions: Watched / Wishlist / Favorite
 */
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

    // Navigation
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

    // Status buttons (reflect current state)
    if (ctx.user?.email) {
        const st = item.initialDbState;
        keyboard
            .row()
            .text(st.isWatched ? `✅ ${t.watched}` : `👀 ${t.watched}`, `${actBase}_w`)
            .row()
            .text(st.isWishlist ? `📌 ${t.wishlist}` : `➕ ${t.wishlist}`, `${actBase}_wl`)
            .text(st.isFavorite ? `⭐ ${t.favorite}` : `☆ ${t.favorite}`, `${actBase}_fav`);
    }
    // Back to genre list
    keyboard.row().text(t.Back, `disc_type_${type}`);

    const photo = item.poster || "https://placehold.co/500x750";

    try {
        if (isPhotoMessage(ctx)) {
            // Already a photo → edit media in-place (fastest, no flicker)
            await ctx.editMessageMedia(
                { type: "photo", media: photo, caption, parse_mode: "Markdown" },
                { reply_markup: keyboard }
            );
        } else {
            // Text message → delete and send a new photo message
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

function escapeMarkdown(text: string) {
    return text.replace(/[_*`[\]]/g, "\\$&");
}