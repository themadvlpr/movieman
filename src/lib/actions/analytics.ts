'use server'
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { getAuthSession } from "@/lib/auth-sessions";

export async function trackVisit(path: string) {
    try {
        const session = await getAuthSession();
        const headerList = await headers();

        const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";

        if (session?.user?.id) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { ip }
            }).catch(err => console.error("Error updating user IP:", err));
        }

        const uaString = headerList.get("user-agent") || "";
        const country = headerList.get("x-vercel-ip-country") || "Unknown";

        const userTimeZone = headerList.get("x-vercel-ip-timezone") || "UTC";

        const parser = new UAParser(uaString);
        const { browser, os, device } = parser.getResult();

        const deviceModel = device.model
            ? `${device.vendor} ${device.model}`
            : device.type || "desktop";

        const today = new Intl.DateTimeFormat('en-CA', {
            timeZone: userTimeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(new Date());

        const now = new Date();

        await prisma.visitor.upsert({
            where: {
                ip_date: { ip, date: today }
            },
            update: {
                lastVisit: now,
                path: path,
                country: country,
                browser: browser.name || "Unknown",
                userAgent: uaString,
                os: os.name || "Unknown",
                device: deviceModel
            },
            create: {
                ip,
                date: today,
                userAgent: uaString,
                browser: browser.name || "Unknown",
                os: os.name || "Unknown",
                device: deviceModel,
                path: path,
                country: country,
                lastVisit: now,
            }
        });
    } catch (error) {
        console.error("Critical error in trackVisit:", error);
    }
}