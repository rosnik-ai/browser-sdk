import { ConfigStore } from "./config";

class StaticMetadata {
    environment: string | null;
    runtime: string;
    runtime_version: string | null;
    sdk_version: string;

    constructor(
        environment: string | null = ConfigStore.getEnvironment(),
        runtime: string = 'javascript',
        sdk_version: string = 'browser-sdk/0.0.3'
    ) {
        this.environment = environment;
        this.runtime = runtime;
        this.runtime_version = navigator.userAgent;
        this.sdk_version = sdk_version;
    }
}

export class Metadata extends StaticMetadata {
    constructor() {
        super();
    }
}