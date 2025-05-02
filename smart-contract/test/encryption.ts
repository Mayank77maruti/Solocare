// Utility to convert string to ArrayBuffer
const textToBuffer = (text: string): Uint8Array => {
    return new TextEncoder().encode(text);
}
  
// Utility to convert ArrayBuffer to base64
const bufferToBase64 = (buffer: ArrayBuffer): string => {
    return btoa(String.fromCharCode(...new Uint8Array(buffer)));
}

// Utility to convert base64 to ArrayBuffer
const base64ToBuffer = (base64: string): ArrayBuffer => {
    return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer;
}
  
// Generate a 256-bit AES key
export async function generateKey(): Promise<CryptoKey> {
    return await crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"],
    );
}
  
// Encrypt the JSON data
export async function encryptData(data: object, key: CryptoKey) {
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV
    const encodedData = textToBuffer(JSON.stringify(data));
    const encrypted = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData,
    );
    return {
        iv: bufferToBase64(iv),
        ciphertext: bufferToBase64(encrypted),
    };
}
  
// Export key to base64 format (for storage)
export async function exportKey(key: CryptoKey): Promise<string> {
    const rawKey = await crypto.subtle.exportKey("raw", key);
    return bufferToBase64(rawKey);
}
  
export async function importKey(base64Key: string): Promise<CryptoKey> {
    const rawKey = base64ToBuffer(base64Key);
    return await crypto.subtle.importKey("raw", rawKey, "AES-GCM", true, [
        "encrypt",
        "decrypt",
    ]);
}
  
export async function decryptData(ciphertext: string, iv: string, key: CryptoKey) {
    const data = base64ToBuffer(ciphertext);
    const ivBuf = base64ToBuffer(iv);
    const decrypted = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: new Uint8Array(ivBuf) },
        key,
        data,
    );
    return JSON.parse(new TextDecoder().decode(decrypted));
}
  