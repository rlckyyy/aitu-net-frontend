import {openDB} from 'idb'

const params = {
    algorithmName: 'RSA-OAEP',
    algorithmNameAES: 'AES-GCM',
    hashName: 'SHA-256'
};

export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: params.algorithmName,
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]), // 65537
            hash: params.hashName
        },
        true,
        ["encrypt", "decrypt"]
    )

    const exportedPublicKey = await crypto.subtle.exportKey("spki", keyPair.publicKey)
    const publicKeyBase64 = ab2b64(exportedPublicKey)

    return {
        publicKey: publicKeyBase64,
        privateKey: keyPair.privateKey
    }
}

export async function generateAESKey() {
    return await crypto.subtle.generateKey(
        {name: params.algorithmNameAES, length: 256},
        true,
        ["encrypt", "decrypt"]
    )
}

export async function encryptWithAES(data: string, aesKey: CryptoKey): Promise<{ encryptedData: string, iv: string }> {
    const encoder = new TextEncoder()
    const iv = crypto.getRandomValues(new Uint8Array(12)) // AES-GCM standard IV size

    const encrypted = await crypto.subtle.encrypt(
        {name: params.algorithmNameAES, iv},
        aesKey,
        encoder.encode(data)
    )

    return {
        encryptedData: ab2b64(encrypted), // Use Buffer instead of btoa
        iv: ab2b64(iv.buffer) // Convert IV to Base64 properly
    }
}

export async function encryptAESKeyWithPublicKey(aesKey: CryptoKey, publicKey: string) {
    // Convert Base64 public key to CryptoKey
    const importedPublicKey = await crypto.subtle.importKey(
        "spki",
        new Uint8Array(b642ab(publicKey)),
        {name: params.algorithmName, hash: params.hashName},
        false,
        ["encrypt"]
    )

    // Export AES key as raw bytes
    const aesKeyRaw = await crypto.subtle.exportKey("raw", aesKey)

    // Encrypt AES key using receiver's public key
    const encryptedAESKey = await crypto.subtle.encrypt(
        {name: params.algorithmName},
        importedPublicKey,
        aesKeyRaw
    )

    return ab2b64(encryptedAESKey) // Convert to Base64
}

export async function decryptAESKeyWithPrivateKey(encryptedAESKey: string, privateKey: CryptoKey) {
    // Decrypt AES key using user's private RSA key
    const decryptedAESKeyRaw = await crypto.subtle.decrypt(
        {name: params.algorithmName},
        privateKey,
        b642ab(encryptedAESKey)
    )

    // Import decrypted AES key back as CryptoKey
    return await crypto.subtle.importKey(
        "raw",
        decryptedAESKeyRaw,
        {name: params.algorithmNameAES, length: 256},
        true,
        ["encrypt", "decrypt"]
    )
}

export async function decryptWithAES(encryptedData: string, iv: string, aesKey: CryptoKey): Promise<string> {
    const decrypted = await crypto.subtle.decrypt(
        {name: params.algorithmNameAES, iv: b642ab(iv)},
        aesKey,
        b642ab(encryptedData)
    )

    return new TextDecoder().decode(decrypted)
}

function ab2b64(arrayBuffer: ArrayBuffer): string {
    return btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
}

function b642ab(base64: string): ArrayBuffer {
    return Uint8Array.from(atob(base64), c => c.charCodeAt(0)).buffer
}

export async function savePrivateKey(privateKey: CryptoKey) {
    const exportedKey = await crypto.subtle.exportKey('pkcs8', privateKey)
    const storage = await openDB('privateKeysStore', 1, {
        upgrade(storage) {
            storage.createObjectStore('privateKeys')
        }
    })
    await storage.put('privateKeys', exportedKey, 'privateKey')
}

export async function getPrivateKey(): Promise<CryptoKey | null> {
    const storage = await openDB('privateKeysStore', 1)
    const storedKey: ArrayBuffer = await storage.get('privateKeys', 'privateKey')
    if (!storedKey) return null
    return await crypto.subtle.importKey('pkcs8', storedKey, {
        name: 'RSA-OAEP',
        hash: 'SHA-256'
    }, true, ['decrypt'])
}