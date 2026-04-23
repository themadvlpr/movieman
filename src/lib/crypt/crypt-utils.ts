const SECRET = process.env.CRYPTO_GENERATE_SECRET || "default_secret_32_chars_long!!!";

export function generateCryptoRandomString(stringToEncrypt: string) {
    if (!SECRET || SECRET.length !== 32) {
        throw new Error("CRYPTO_GENERATE_SECRET must be 32 characters long");
    }

    const buffer = Buffer.from(stringToEncrypt);
    const key = Buffer.from(SECRET);

    const encrypted = Buffer.from(
        buffer.map((byte, i) => byte ^ key[i % key.length])
    );

    return encrypted.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

export function decodeCryptoString(cryptoString: string) {
    try {
        const base64 = cryptoString.replace(/-/g, '+').replace(/_/g, '/');
        const buffer = Buffer.from(base64, 'base64');
        const key = Buffer.from(SECRET);

        const decrypted = Buffer.from(
            buffer.map((byte, i) => byte ^ key[i % key.length])
        );

        return decrypted.toString('utf8');
    } catch (e) {
        return null;
    }
}