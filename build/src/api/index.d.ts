declare const _default: {
    /**
     * Start the Express and listen to the specified port
     *
     * This will also enable any assets in the /assets/ folder to be called via http://localhost:port/assets/
     *
     * Note: This only launches an HTTP Server, if you require HTTPS you need to add an HTTPS configuration like NGINX in front of this app.
     *
     * @param {WrangleBot} bot
     * @param {number} port the port number
     * @param key
     * @return {Promise<{httpServer,socketServer,transporter}>}
     */
    init(bot: any, port: number | undefined, key: any): Promise<unknown>;
};
export default _default;
//# sourceMappingURL=index.d.ts.map