import { get, set, del } from 'idb-keyval';

/**
 * 安全存储管理器
 * 使用 IndexedDB + Web Crypto API 加密存储敏感数据
 */
export class SecureStorage {
    private static KEYS = {
        API_KEY: 'gemini_api_key_encrypted',
        API_ENDPOINT: 'gemini_api_endpoint',
        ENCRYPTION_SALT: 'encryption_salt',
    };

    // 用于加密的固定密钥 (应用级密钥)
    private static async getDerivedKey(): Promise<CryptoKey> {
        const encoder = new TextEncoder();

        // 使用固定的应用密钥 (所有用户共享,但仍需 salt)
        const appSecret = 'next-banana-secure-storage-v1-2025';

        // 获取或生成 salt
        let salt = await get<Uint8Array>(this.KEYS.ENCRYPTION_SALT);
        if (!salt) {
            salt = crypto.getRandomValues(new Uint8Array(16));
            await set(this.KEYS.ENCRYPTION_SALT, salt);
        }

        // 导入密码
        const passwordKey = await crypto.subtle.importKey(
            'raw',
            encoder.encode(appSecret),
            { name: 'PBKDF2' },
            false,
            ['deriveBits', 'deriveKey']
        );

        // 派生 AES 密钥
        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt as BufferSource,
                iterations: 100000,
                hash: 'SHA-256',
            },
            passwordKey,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * 加密字符串
     */
    private static async encrypt(plaintext: string): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const key = await this.getDerivedKey();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            key,
            data
        );

        return { encrypted, iv };
    }

    /**
     * 解密字符串
     */
    private static async decrypt(encrypted: ArrayBuffer, iv: Uint8Array): Promise<string> {
        const key = await this.getDerivedKey();
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: iv as BufferSource },
            key,
            encrypted
        );

        const decoder = new TextDecoder();
        return decoder.decode(decrypted);
    }

    /**
     * 保存 API 密钥 (加密存储)
     */
    static async saveApiKey(apiKey: string): Promise<void> {
        if (!apiKey || !apiKey.trim()) {
            throw new Error('API key cannot be empty');
        }

        const { encrypted, iv } = await this.encrypt(apiKey);

        // 存储加密数据和 IV
        await set(this.KEYS.API_KEY, {
            data: Array.from(new Uint8Array(encrypted)),
            iv: Array.from(iv),
        });
    }

    /**
     * 获取 API 密钥 (解密)
     */
    static async getApiKey(): Promise<string | null> {
        try {
            const stored = await get<{ data: number[]; iv: number[] }>(this.KEYS.API_KEY);
            if (!stored) {
                return null;
            }

            const encrypted = new Uint8Array(stored.data).buffer;
            const iv = new Uint8Array(stored.iv);

            return await this.decrypt(encrypted, iv);
        } catch (error) {
            console.error('Failed to decrypt API key:', error);

            // 解密失败,清除损坏的数据
            await del(this.KEYS.API_KEY);
            console.warn('已清除损坏的加密数据,请重新输入 API 密钥');

            return null;
        }
    }

    /**
     * 保存 API Endpoint
     */
    static async saveEndpoint(endpoint: string): Promise<void> {
        await set(this.KEYS.API_ENDPOINT, endpoint);
    }

    /**
     * 获取 API Endpoint
     */
    static async getEndpoint(): Promise<string | null> {
        const endpoint = await get<string>(this.KEYS.API_ENDPOINT);
        return endpoint ?? null;
    }

    /**
     * 清除所有数据
     */
    static async clearAll(): Promise<void> {
        await del(this.KEYS.API_KEY);
        await del(this.KEYS.API_ENDPOINT);
        await del(this.KEYS.ENCRYPTION_SALT);
    }
}
