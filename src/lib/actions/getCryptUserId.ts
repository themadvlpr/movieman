"use server"
import { generateCryptoRandomString } from "@/lib/crypt/crypt-utils";
import { getAuthSession } from "@/lib/auth-sessions";

export async function getCryptUserId() {
    const session = await getAuthSession();
    if (!session?.user?.id) return null;
    return generateCryptoRandomString(session.user.id);
}
