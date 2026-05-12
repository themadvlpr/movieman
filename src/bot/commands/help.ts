import { MyContext } from "@/bot/core";
import { locales, Language } from "@/bot/locales";

export async function helpCommand(ctx: MyContext) {
    ctx.session.step = 'idle';

    const lang = (ctx.user?.language as Language) || (ctx.from?.language_code as Language) || "en";
    const t = locales[lang] || locales.en;

    return ctx.reply(
        t.help_command,
        { parse_mode: "HTML" }
    );
}