import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function discoverCommand(ctx: MyContext) {
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    const keyboard = new InlineKeyboard()
        .text("🎬 Movies", "disc_type_movie")
        .text("📺 TV Shows", "disc_type_tv");

    await ctx.reply("What do you want to watch?", { reply_markup: keyboard });
}