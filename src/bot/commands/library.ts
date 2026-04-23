import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "../locales";

export async function libraryCommand(ctx: MyContext) {
    const user = ctx.user;
    const lang = (ctx.language || "en") as Language;
    const t = locales[lang];

    // If user has no email/password (just a guest from TG), tell them to link
    if (!user || !user.email) {
        return ctx.reply(t.link_account_prompt || "Please link your account to view your library!");
    }

    const keyboard = new InlineKeyboard()
        .text(t.library_watched, "lib_watched")
        .text(t.library_plan, "lib_plan").row()
        .text(t.library_favs, "lib_favs")
        .text(t.library_stats, "lib_stats");

    await ctx.reply(t.library_title, {
        parse_mode: "Markdown",
        reply_markup: keyboard
    });
}