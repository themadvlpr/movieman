import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";
import prisma from "@/lib/prisma";
import { toggleMediaStatus } from "@/lib/db/media";

const TMDB_IMG = "https://image.tmdb.org/t/p/w500";
const PER_PAGE = 10;

export type LibCat = "w" | "wl" | "fav";

const sortOrder = { watchedDate: "desc" } as const;

const CAT_FIELD: Record<LibCat, "isWatched" | "isWishlist" | "isFavorite"> = {
    w: "isWatched",
    wl: "isWishlist",
    fav: "isFavorite",
};

// Safe escape for Markdown V1
function em(t: string) {
    if (!t) return "";
    return t.replace(/[_*`[\]]/g, "\\$&");
}

function isPhoto(ctx: MyContext) {
    return !!ctx.callbackQuery?.message?.photo;
}

function truncate(str: string, limit: number) {
    const chars = [...str];
    if (chars.length <= limit) return str;
    return chars.slice(0, limit - 3).join("") + "...";
}

async function editOrReply(ctx: MyContext, text: string, extra: any) {
    if (isPhoto(ctx)) {
        try {
            await ctx.deleteMessage();
        } catch { }
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

function getTitle(media: any, lang: string) {
    if (lang === "ru") return media.titleRu || media.titleEn || "N/A";
    if (lang === "uk") return media.titleUk || media.titleEn || "N/A";
    return media.titleEn || media.titleRu || "N/A";
}

function getPoster(media: any, lang: string) {
    const path =
        lang === "ru"
            ? media.posterRu || media.posterEn
            : lang === "uk"
                ? media.posterUk || media.posterEn
                : media.posterEn || media.posterRu || media.posterUk;
    return path ? `${TMDB_IMG}${path}` : null;
}

// ── Main library screen ─────────────────────────────────────────────────────
export async function libraryCommand(ctx: MyContext) {
    const user = ctx.user;
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    if (!user?.email) {
        return editOrReply(ctx, t.link_account_prompt, {});
    }

    const uid = user.id;
    const [watched, wishlist, favs] = await Promise.all([
        prisma.userMedia.count({ where: { userId: uid, isWatched: true } }),
        prisma.userMedia.count({ where: { userId: uid, isWishlist: true } }),
        prisma.userMedia.count({ where: { userId: uid, isFavorite: true } }),
    ]);

    // Total unique media (watched OR wishlist OR favorite)
    const totalUnique = await prisma.userMedia.count({
        where: {
            userId: uid,
            OR: [{ isWatched: true }, { isWishlist: true }, { isFavorite: true }],
        },
    });

    // We build the message carefully to avoid nested Markdown errors
    const userName = em(user.name || "User");
    const labelWatched = em(t.library_watched);
    const labelPlan = em(t.library_plan);
    const labelFavs = em(t.library_favs);

    // Extract "Total count" label from locales if possible, or use a default
    const totalLabel = lang === "ru" ? "Общее количество" : lang === "uk" ? "Загальна кількість" : "Total items";

    const linkUrl = `${process.env.BETTER_AUTH_URL}/${lang === 'uk' ? 'ua' : lang}/library`
    const linkText = `🔗 [${t.view_on_site || "View on Website"}](${linkUrl})`;

    const text =
        `📂 _${em(t.library)}_: *${userName}*\n\n` +
        `📊 *${em(totalLabel)}:* ${totalUnique}\n\n` +
        `*${labelWatched}:* ${watched}\n` +
        `*${labelPlan}:* ${wishlist}\n` +
        `*${labelFavs}:* ${favs} \n\n` +
        `${linkText}`;

    const kb = new InlineKeyboard()
        .text(`${t.library_watched} (${watched})`, "lib_cat_w_1")
        .row()
        .text(`${t.library_plan} (${wishlist})`, "lib_cat_wl_1")
        .text(`${t.library_favs} (${favs})`, "lib_cat_fav_1");

    await editOrReply(ctx, text, { parse_mode: "Markdown", reply_markup: kb });
}

// ── List view ───────────────────────────────────────────────────────────────
export async function showLibraryListView(ctx: MyContext, cat: LibCat, page: number) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const uid = ctx.user?.id;
    if (!uid) return;

    const field = CAT_FIELD[cat];
    const [totalCount, items] = await Promise.all([
        prisma.userMedia.count({ where: { userId: uid, [field]: true } }),
        prisma.userMedia.findMany({
            where: { userId: uid, [field]: true },
            include: { media: true },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            orderBy: sortOrder,
        }),
    ]);

    console.log(' ITEMS: ', items);


    const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
    const catLabel = cat === "w" ? t.library_watched : cat === "wl" ? t.library_plan : t.library_favs;

    if (!items.length) {
        return editOrReply(ctx, `${em(catLabel)}: 0`, {
            reply_markup: new InlineKeyboard().text(t.Back, "lib_main"),
        });
    }

    const header = `*${em(catLabel)}* – _(${em(t.page)} ${page}/${totalPages})_`;
    const linkUrl = `${process.env.BETTER_AUTH_URL}/${lang === 'uk' ? 'ua' : lang}/library?category=${cat === 'w' ? 'watched' : cat === 'wl' ? 'wishlist' : 'favorites'}`;

    const linkText = `🔗 [${t.view_on_site || "View on Website"}](${linkUrl})`;
    const text = header + "\n\n" + linkText;

    const kb = new InlineKeyboard();
    items.forEach((item, i) => {
        const title = getTitle(item.media, lang);
        const year = item.media.releaseDate ? new Date(item.media.releaseDate).getFullYear() : "—";
        const icon = item.media.type === "movie" ? "🎬" : "📺";
        // Button labels don't need markdown escaping
        const label = truncate(`${(page - 1) * PER_PAGE + i + 1}. ${title} (${year}) ${icon}`, 40);
        kb.text(label, `lib_c_${cat}_${page}_${i}`).row();
    });

    kb.text(`🃏 ${t.card_view}`, `lib_c_${cat}_${page}_0`).row();

    if (page > 1) kb.text("⬅️", `lib_cat_${cat}_${page - 1}`);
    if (totalPages > page) kb.text("➡️", `lib_cat_${cat}_${page + 1}`);

    kb.row().text(t.Back, "lib_main");

    await editOrReply(ctx, text, { parse_mode: "Markdown", reply_markup: kb });
}

// ── Card view ───────────────────────────────────────────────────────────────
export async function showLibraryCard(ctx: MyContext, cat: LibCat, page: number, index: number) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];
    const uid = ctx.user?.id;
    if (!uid) return;

    const field = CAT_FIELD[cat];
    const [totalCount, items] = await Promise.all([
        prisma.userMedia.count({ where: { userId: uid, [field]: true } }),
        prisma.userMedia.findMany({
            where: { userId: uid, [field]: true },
            include: { media: true },
            skip: (page - 1) * PER_PAGE,
            take: PER_PAGE,
            orderBy: sortOrder,
        }),
    ]);

    if (!items.length) {
        return editOrReply(ctx, t.empty_results, {
            reply_markup: new InlineKeyboard().text(t.Back, "lib_main"),
        });
    }

    const totalPages = Math.max(1, Math.ceil(totalCount / PER_PAGE));
    const safeIdx = Math.max(0, Math.min(index, items.length - 1));
    const entry = items[safeIdx];
    const media = entry.media;

    const title = getTitle(media, lang);
    const year = media.releaseDate ? new Date(media.releaseDate).getFullYear() : "N/A";
    const typeIcon = media.type === "movie" ? "🎬" : "📺";
    const rating = media.tmdbRating ? `⭐ ${media.tmdbRating.toFixed(1)}/10` : "N/A";
    const userRating = entry.userRating ? `\n🎯 *${em(t.rating)}:* ${entry.userRating}/10` : "";
    const globalNum = (page - 1) * PER_PAGE + safeIdx + 1;


    const linkUrl = `${process.env.BETTER_AUTH_URL}/${lang === 'uk' ? 'ua' : lang}/${media.type === "movie" ? "movies" : "tvseries"}/${media.tmdbId}`;

    const linkText = `🔗 [${t.view_on_site || "View on Website"}](${linkUrl})`;

    const caption =
        `${typeIcon} *${em(title)}* (${year})\n\n` +
        `📊 *TMDB:* ${rating}` +
        userRating +
        `\n_(${globalNum}/${totalCount})_` +
        `\n\n${linkText}`;

    const kb = new InlineKeyboard();
    const navBase = `lib_c_${cat}`;
    const actBase = `lib_a_${cat}_${page}_${safeIdx}`;

    // Navigation row
    const hasPrev = safeIdx > 0 || page > 1;
    const hasNext = safeIdx < items.length - 1 || totalPages > page;

    if (hasPrev) {
        const prevPage = safeIdx > 0 ? page : page - 1;
        const prevIdx = safeIdx > 0 ? safeIdx - 1 : PER_PAGE - 1;
        kb.text("⬅️", `${navBase}_${prevPage}_${prevIdx}`);
    }
    if (hasNext) {
        const nextPage = safeIdx < items.length - 1 ? page : page + 1;
        const nextIdx = safeIdx < items.length - 1 ? safeIdx + 1 : 0;
        kb.text("➡️", `${navBase}_${nextPage}_${nextIdx}`);
    }

    // Toggle actions row
    kb.row()
        .text(entry.isWatched ? "✅" : "👀", `${actBase}_w`)
        .text(entry.isWishlist ? "📌" : "✍️", `${actBase}_wl`)
        .text(entry.isFavorite ? "❤️" : "🤍", `${actBase}_fav`);

    kb.row().text(`📋 ${t.list_view}`, `lib_cat_${cat}_${page}`);
    kb.row().text(t.Back, "lib_main");

    const posterPath = getPoster(media, lang);
    const photo = posterPath || "https://placehold.co/500x750";

    try {
        if (isPhoto(ctx)) {
            try {
                await ctx.editMessageMedia(
                    { type: "photo", media: photo, caption, parse_mode: "Markdown" },
                    { reply_markup: kb }
                );
            } catch (err: any) {
                if (!err.message?.includes("message is not modified")) {
                    throw err;
                }
            }
        } else {
            if (ctx.callbackQuery) {
                try { await ctx.deleteMessage(); } catch { }
            }
            await ctx.replyWithPhoto(photo, { caption, parse_mode: "Markdown", reply_markup: kb });
        }
    } catch (err) {
        console.error("showLibraryCard error:", err);
    }
}

// ── Toggle action from library card ─────────────────────────────────────────
export async function libraryToggleAction(
    ctx: MyContext,
    cat: LibCat,
    page: number,
    index: number,
    actionCode: string
) {
    const uid = ctx.user?.id;
    if (!uid) return;

    const field = CAT_FIELD[cat];
    const items = await prisma.userMedia.findMany({
        where: { userId: uid, [field]: true },
        include: { media: true },
        skip: (page - 1) * PER_PAGE,
        take: PER_PAGE,
        orderBy: sortOrder,
    });

    const safeIdx = Math.max(0, Math.min(index, items.length - 1));
    const entry = items[safeIdx];
    if (!entry) return;

    const actionMap: Record<string, "isWatched" | "isWishlist" | "isFavorite"> = {
        w: "isWatched",
        wl: "isWishlist",
        fav: "isFavorite",
    };
    const action = actionMap[actionCode];

    await toggleMediaStatus(uid, entry.media.tmdbId, action, entry.media.type);

    // After toggle, the item might no longer belong to the current category (e.g. removed from favorites)
    // However, for UX we usually keep showing it or refresh.
    // Let's just refresh the card.
    await showLibraryCard(ctx, cat, page, index);
}