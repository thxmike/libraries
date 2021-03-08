export declare class ConfigurationService {
    private _configuration;
    private _environment_variables;
    constructor(configuration: any);
    apply_environment_override(object?: any, parent?: string): void;
    private merge;
    get configuration(): any;
}
