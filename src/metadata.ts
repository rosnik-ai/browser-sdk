class StaticMetadata {
    environment: string | null;
    runtime: string;
    runtime_version: string | null;
    sdk_version: string;

    constructor(
        // TODO: figure out how to set environment.
        // environment: string | null = process.env.ROSNIK_ENVIRONMENT || null,
        runtime: string = 'javascript',
        // TODO: figure out what to do with this for javascript
        sdk_version: string = '0.0.14'
    ) {
        this.environment = null;
        this.runtime = runtime;
        this.runtime_version = null;
        this.sdk_version = sdk_version;
    }
}

export class Metadata extends StaticMetadata {
    function_fingerprint: string[];

    constructor(function_fingerprint: string[]) {
        super();
        this.function_fingerprint = function_fingerprint;
    }
}