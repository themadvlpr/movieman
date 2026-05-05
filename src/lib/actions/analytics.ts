'use server'
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function trackVisit(path: string) {
    const headerList = await headers();
    const ip = headerList.get("x-forwarded-for")?.split(',')[0] || "127.0.0.1";
    const uaString = headerList.get("user-agent") || "";

    const country = headerList.get("x-vercel-ip-country") || "Unknown";


    const parser = new UAParser(uaString);
    const { browser, os, device } = parser.getResult();

    const deviceModel = device.model
        ? `${device.vendor} ${device.model}`
        : device.type || "desktop";

    const today = new Date().toISOString().split('T')[0];

    await prisma.visitor.upsert({
        where: {
            ip_date: { ip, date: today }
        },
        update: {
            lastVisit: new Date(),
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
        }
    });
}