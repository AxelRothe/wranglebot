export default interface WrangleBotOptions {
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
