import { getDiscoverMovies } from "@/lib/tmdb/getDiscoverMovies";
import { MyContext } from "@/bot/core";
import { locales, Language } from "../locales";

export async function discoverCommand(ctx: MyContext) {
    const user = ctx.user;
    // Default to 'en' if context language is missing
    const lang = (ctx.language || "en") as Language;

    const t = locales[lang] || locales.en;

    const genreId = ctx.match || "28";

    try {
        const tmdbLang = lang === 'ru' ? 'ru-RU' :
            lang === 'uk' ? 'uk-UA' : 'en-US';

        // Passing user?.id or null for guests
        const data = await getDiscoverMovies(genreId as string, user?.id || "", "1", tmdbLang);

        if (!data.results || data.results.length === 0) {
            return ctx.reply(t.error);
        }

        const topMovies = data.results.slice(0, 3);

        for (const movie of topMovies) {
            let statusText = "";

            if (user) {
                // User is authenticated
                const status = movie.initialDbState.isWatched ? "✅ Watched" : "⏳ Plan to watch";
                const rating = movie.initialDbState.userRating ? `⭐ ${movie.initialDbState.userRating}/10` : "No rating";
                statusText = `\n\n*Status:* ${status}\n*Rating:* ${rating}`;
            } else {
                // Guest mode
                statusText = `\n\n💡 _Link your account to track your collection!_`;
            }

            // Clean tagline from Markdown-breaking characters
            const cleanTagline = movie.tagline ? movie.tagline.replace(/[_*`[\]]/g, '') : "";

            await ctx.replyWithPhoto(
                movie.poster || "https://via.placeholder.com/500x750",
                {
                    caption: `🎬 *${movie.title}*\n${cleanTagline ? `_${cleanTagline}_` : ""}${statusText}`,
                    parse_mode: "Markdown",
                }
            );
        }
    } catch (e) {
        console.error("Discover Error:", e);
        await ctx.reply(t.error);
    }
}