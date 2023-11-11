export interface Configuration {
    apiKey: string;
    allowedDomains?: string[];
    // in ms
    journeyTimeout?: number;
    user?: string;
    deviceId?: string;
    environment?: string;
  }

export class ConfigStore {
    private static config: Configuration | null = null;

    public static setConfig(config: Configuration): void {
        if (!this.config) {
            if (!config.journeyTimeout) {
                config.journeyTimeout = 30 * 60 * 1000; // 30 minutes
            }
            this.config = config;
        } else {
            console.warn("Config is already set. It cannot be reinitialized.");
        }
    }

    public static getConfig(): Configuration | null {
        return this.config;
    }

    public static resetConfig(): void {
        this.config = null;
    }

    public static getApiKey(): string | null {
        return this.config?.apiKey || null;
    }

    public static getAllowedDomains(): string[] {
        return this.config?.allowedDomains || [];
    }

    public static getUser(): string | null {
        return this.config?.user || null;
    }

    public static setUserId(userId: string) {
        this.config!.user = userId;
    }

    public static getDeviceId(): string {
        return this.config?.deviceId!;
    }

    public static getEnvironment(): string | null {
        return this.config?.environment || null;
    }

    public static getJourneyTimeout(): number {
        return this.config?.journeyTimeout!;
    }
}