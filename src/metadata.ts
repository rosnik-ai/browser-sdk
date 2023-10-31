import { ConfigStore } from "./config";

class StaticMetadata {
    environment: string | null;
    runtime: string;
    runtime_version: string | null;
    sdk_version: string;

    constructor(
        environment: string | null = ConfigStore.getEnvironment(),
        runtime: string = 'javascript',
        sdk_version: string = 'browser-sdk/0.0.2'
    ) {
        this.environment = environment;
        this.runtime = runtime;
        this.runtime_version = navigator.userAgent;
        this.sdk_version = sdk_version;
    }
}

export class Metadata extends StaticMetadata {
    function_fingerprint: string;

    constructor() {
        super();
        // We don't track these in the browser.
        this.function_fingerprint = "";
    }
}