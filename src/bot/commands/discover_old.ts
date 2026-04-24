import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies";
import { MyContext } from "@/bot/core";
import { locales, Language } from "../locales";
import { InlineKeyboard } from "grammy";

export async function discoverOldCommand(ctx: MyContext) {
    const user = ctx.user?.email ? ctx.user : null;
    const lang = (ctx.user?.language || "en") as Language;
    const t = locales[lang] || locales.en;

    const callbackData = ctx.callbackQuery?.data?.split("_");
    const genreId = callbackData ? callbackData[1] : (ctx.match || "28");
    const page = callbackData ? parseInt(callbackData[2]) : 1;
    const index = callbackData ? parseInt(callbackData[3]) : 0;

    try {
        const tmdbLang = lang === 'ru' ? 'ru-RU' : lang === 'uk' ? 'uk-UA' : 'en-US';

        const data = await getDiscoverMovies(genreId as string, user?.id || "", page.toString(), tmdbLang);

        if (!data.results || data.results.length === 0) {
            return ctx.reply(t.error);
        }

        const movie = data.results[index];
        const totalInPage = data.results.length;

        let statusText = user
            ? `\n\n*Status:* ${movie.initialDbState.isWatched ? "✅ Watched" : "⏳ Plan"} \n*Rating:* ${movie.initialDbState.userRating || "No"}`
            : `\n\n💡 _Link account to track!_`;

        const cleanTagline = movie.tagline ? movie.tagline.replace(/[_*`[\]]/g, '') : "";
        const caption = `🎬 *${movie.title}* (${index + 1}/${totalInPage})\n${cleanTagline ? `_${cleanTagline}_` : ""}${statusText}`;

        const keyboard = new InlineKeyboard();

        if (index > 0) {
            keyboard.text("⬅️", `discold_${genreId}_${page}_${index - 1}`);
        } else if (page > 1) {
            keyboard.text("⬅️ (Prev Page)", `discold_${genreId}_${page - 1}_${19}`);
        }

        if (index < totalInPage - 1) {
            keyboard.text("➡️", `discold_${genreId}_${page}_${index + 1}`);
        } else {
            keyboard.text("➡️ (Next Page)", `discold_${genreId}_${page + 1}_0`);
        }

        const photo = movie.poster || "https://via.placeholder.com/500x750";

        if (ctx.callbackQuery) {
            await ctx.editMessageMedia(
                { type: "photo", media: photo, caption, parse_mode: "Markdown" },
                { reply_markup: keyboard }
            );
            await ctx.answerCallbackQuery();
        } else {
            await ctx.replyWithPhoto(photo, { caption, parse_mode: "Markdown", reply_markup: keyboard });
        }

    } catch (e) {
        console.error("Discover Error:", e);
        if (ctx.callbackQuery) await ctx.answerCallbackQuery("Error");
        await ctx.reply(t.error);
    }
}