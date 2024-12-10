export default interface WrangleBotOptions {
    app_data_location: string;
    vault: {
        token?: string;
        sync_url?: string;
        ai_url?: string;
        key?: string;
    };
    port: number;
    secret: string;
    mail?: {
        host: string;
        port: number;
        auth: {
            user: string;
            pass: string;
        };
    };
}
//# sourceMappingURL=WrangleBotOptions.d.ts.map