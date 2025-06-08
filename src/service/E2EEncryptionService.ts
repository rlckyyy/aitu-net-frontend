import {get} from "idb-keyval";
import {ChatMessage} from "@/models/chat/ChatMessage";

export class E2EEncryptionService {
    private static instance: E2EEncryptionService
    private privateKey: CryptoKey | null = null

    private constructor() {}

    static getInstance(): E2EEncryptionService {
        if (!E2EEncryptionService.instance) {
            E2EEncryptionService.instance = new E2EEncryptionService()
        }
        return E2EEncryptionService.instance
    }

    async initialize(): Promise<void> {
        try {
            const privateKey = await get('rsa-private-key')
            this.privateKey = privateKey || null
            if (!this.privateKey) {
                console.warn('Private key not found')
            }
        } catch (error) {
            console.error('Failed to load private key:', error)
        }
    }

    async encryptMessage(plainText: string, publicKeys: Record<string, string>): Promise<{
        encryptedContent: Record<string, string>
        encryptedKeys: Record<string, string>
    }> {
        const aesKey = await window.crypto.subtle.generateKey(
            { name: "AES-GCM", length: 256 },
            true,
            ["encrypt", "decrypt"]
        )
        const encoder = new TextEncoder()
        const data = encoder.encode(plainText)
        const iv = window.crypto.getRandomValues(new Uint8Array(12))
        const encryptedData = await window.crypto.subtle.encrypt(
            { name: "AES-GCM", iv: iv },
            aesKey,
            data
        )
        const encryptedMessageData = {
            encryptedData: this.arrayBufferToBase64(encryptedData),
            iv: this.arrayBufferToBase64(iv.buffer)
        }
        const encryptedContent: Record<string, string> = {}
        const encryptedKeys: Record<string, string> = {}
        for (const [userId, publicKeyBase64] of Object.entries(publicKeys)) {
            encryptedKeys[userId] = await this.encryptAESKeyWithRSA(aesKey, publicKeyBase64)

            encryptedContent[userId] = JSON.stringify(encryptedMessageData)
        }
        return { encryptedContent, encryptedKeys }
    }

    async decryptMessage(encryptedMessage: ChatMessage, currentUserId: string): Promise<string> {
        if (!this.privateKey) {
            throw new Error('Private key not available')
        }

        const encryptedAESKey = encryptedMessage.encryptedKeys[currentUserId]
        if (!encryptedAESKey) {
            throw new Error('No encrypted key for current user')
        }

        const aesKey = await this.decryptAESKeyWithRSA(encryptedAESKey)

        const encryptedContent = encryptedMessage.encryptedContent[currentUserId]
        if (!encryptedContent) {
            throw new Error('No encrypted content for current user')
        }

        const { encryptedData, iv } = JSON.parse(encryptedContent)

        const encryptedBuffer = this.base64ToArrayBuffer(encryptedData)
        const ivBuffer = this.base64ToArrayBuffer(iv)

        const decryptedData = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivBuffer },
            aesKey,
            encryptedBuffer
        )

        const decoder = new TextDecoder()
        return decoder.decode(decryptedData)
    }

    private async encryptAESKeyWithRSA(aesKey: CryptoKey, publicKeyBase64: string): Promise<string> {
        const publicKey = await this.importPublicKey(publicKeyBase64)
        const exportedKey = await window.crypto.subtle.exportKey('raw', aesKey)

        const encryptedKey = await window.crypto.subtle.encrypt(
            { name: "RSA-OAEP" },
            publicKey,
            exportedKey
        )

        return this.arrayBufferToBase64(encryptedKey)
    }

    private async decryptAESKeyWithRSA(encryptedKeyBase64: string): Promise<CryptoKey> {
        if (!this.privateKey) {
            throw new Error('Private key not available')
        }

        const encryptedKey = this.base64ToArrayBuffer(encryptedKeyBase64)

        const decryptedKey = await window.crypto.subtle.decrypt(
            { name: "RSA-OAEP" },
            this.privateKey,
            encryptedKey
        )

        return await window.crypto.subtle.importKey(
            'raw',
            decryptedKey,
            { name: 'AES-GCM' },
            false,
            ['encrypt', 'decrypt']
        )
    }

    private async importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
        const keyData = this.base64ToArrayBuffer(publicKeyBase64)

        return await window.crypto.subtle.importKey(
            'spki',
            keyData,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            false,
            ['encrypt']
        )
    }

    private arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i])
        }
        return btoa(binary)
    }

    private base64ToArrayBuffer(base64: string): ArrayBuffer {
        const binaryString = atob(base64)
        const bytes = new Uint8Array(binaryString.length)
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i)
        }
        return bytes.buffer
    }
}