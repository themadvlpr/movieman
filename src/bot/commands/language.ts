import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function languageCommand(ctx: MyContext) {

    ctx.session.step = 'idle';

    const lang = (ctx.user?.language || ctx.language) as Language || "en";
    const t = locales[lang];

    const keyboard = new InlineKeyboard()
        .text(`${lang === "en" ? "✅" : ""} English 🇬🇧`, "set_lang_en")
        .text(`${lang === "ru" ? "✅" : ""} Русский 🏳️`, "set_lang_ru")
        .row()
        .text(`${lang === "uk" ? "✅" : ""} Українська 🇺🇦`, "set_lang_uk");

    await ctx.reply(t.choose_lang, { reply_markup: keyboard });
}