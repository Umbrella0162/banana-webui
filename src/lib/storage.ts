export class StorageManager {
    private static KEYS = {
        API_KEY: 'gemini_api_key',
        API_ENDPOINT: 'gemini_api_endpoint',
        LAST_CONFIG: 'last_generation_config',
    };

    static saveApiKey(key: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.KEYS.API_KEY, key);
        }
    }

    static getApiKey(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.KEYS.API_KEY);
        }
        return null;
    }

    static saveEndpoint(endpoint: string) {
        if (typeof window !== 'undefined') {
            localStorage.setItem(this.KEYS.API_ENDPOINT, endpoint);
        }
    }

    static getEndpoint(): string | null {
        if (typeof window !== 'undefined') {
            return localStorage.getItem(this.KEYS.API_ENDPOINT);
        }
        return null;
    }

    static clearAll() {
        if (typeof window !== 'undefined') {
            Object.values(this.KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
        }
    }
}
