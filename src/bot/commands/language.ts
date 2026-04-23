import { InlineKeyboard } from "grammy";
import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function languageCommand(ctx: MyContext) {
    // if (!ctx.user) return;
    const lang = (ctx.user?.language as Language) || "en";
    const t = locales[lang];

    const keyboard = new InlineKeyboard()
        .text("English 🇬🇧", "set_lang_en")
        .text("Русский 🏳️", "set_lang_ru")
        .row()
        .text("Українська 🇺🇦", "set_lang_uk");

    await ctx.reply(t.choose_lang, { reply_markup: keyboard });
}