/// <reference types="node" />
import { EventEmitter } from "events";
export default class CancelToken extends EventEmitter {
    private cancel;
    private callback;
    constructor(callback?: () => void);
    addCallback(callback: any): void;
    abort(): void;
}
//# sourceMappingURL=CancelToken.d.ts.map