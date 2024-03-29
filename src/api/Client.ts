interface ClientCallbacks {
  event: string;
  callback: (data: any) => void;
}

interface ClientSubscriptions {
  [key: string]: string[];
}

export default class Client {
  /**
   * @type {Socket}
   */
  socket;
  username;
  callbacks: ClientCallbacks[] = [];

  subscriptions: ClientSubscriptions = {};

  constructor(socket, username) {
    this.socket = socket;
    this.username = username;
  }

  /**
   * Adds a Hook to the Client
   *
   * @example
   * client.addHook("message", (data : Betweeny) => {
   *  console.log(data);
   * });
   *
   * @param event {string} The event to listen for
   * @param callback {function} The callback to run when the event is triggered
   *
   */
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

  /**
   * to be used after changing the socket
   *
   * @example
   * client.syncHooks();
   *
   * @returns {void}
   */
  syncHooks(): void {
    this.socket.removeAllListeners();
    for (let i = 0; i < this.callbacks.length; i++) {
      this.socket.on(this.callbacks[i].event, this.callbacks[i].callback);
    }
  }
}
