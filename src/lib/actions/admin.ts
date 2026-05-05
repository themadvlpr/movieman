'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";

export async function getUsers() {
    const session = await getAuthSession();
    // In a real app, you'd check for an admin role here.
    // For now, we'll just allow it if authenticated.
    if (!session) throw new Error("Unauthorized");

    const users = await prisma.user.findMany({
        include: {
            _count: {
                select: {
                    userMedia: true,
                    lists: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return users;
}

export async function getVisitors() {
    const session = await getAuthSession();
    if (!session) throw new Error("Unauthorized");

    const visitors = await prisma.visitor.findMany({
        orderBy: {
            lastVisit: 'desc'
        },
        take: 100 // Limit to last 100 for performance
    });

    return visitors;
}
