'use server'

import prisma from "@/lib/prisma";
import { getAuthSession } from "@/lib/auth-sessions";

import { generateCryptoRandomString } from "@/lib/crypt/crypt-utils";

export async function getUsers() {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

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

    return users.map(user => ({
        ...user,
        encryptedId: generateCryptoRandomString(user.id)
    }));
}

export async function getVisitors() {
    const session = await getAuthSession();
    
    if (!session || session.user.role !== 'admin') {
        throw new Error("Unauthorized");
    }

    const visitors = await prisma.visitor.findMany({
        orderBy: {
            lastVisit: 'desc'
        },
        take: 100 // Limit to last 100 for performance
    });

    return visitors;
}
