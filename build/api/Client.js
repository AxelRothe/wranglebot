export default class Client {
    constructor(socket, username) {
        this.callbacks = [];
        this.subscriptions = {};
        this.socket = socket;
        this.username = username;
    }
    addHook(event, callback) {
        let cb = {
            event,
            callback: (data) => {
                callback(this, data);
            },
        };
        this.callbacks.push(cb);
        this.socket.on(event, cb.callback);
    }
    syncHooks() {
        this.socket.removeAllListeners();
        for (let i = 0; i < this.callbacks.length; i++) {
            this.socket.on(this.callbacks[i].event, this.callbacks[i].callback);
        }
    }
}
//# sourceMappingURL=Client.js.map