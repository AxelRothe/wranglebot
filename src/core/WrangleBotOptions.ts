export default interface WrangleBotOptions {
  client: {
    database: {
      cloud?: {
        token: string;
        databaseURL: string;
        machineLearningURL: string;
      };
      local?: {
        key: string;
      };
    };
    port: number;
    secret: string;
  };

  mailConfig?: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
  };
}
