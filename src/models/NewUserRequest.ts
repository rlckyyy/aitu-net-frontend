export type NewUserRequest = {
    username: string
    email: string
    password: string
    publicKey?: string
    encryptedPrivateKeyDto?: {
        encryptedKey: string
        salt: string
        iv: string
    }
}