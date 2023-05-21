/**
 * @typedef {"waiting"|"doing"|"done"|"failed"} StatusStrings
 */
declare class Status {
    status2: any;
    constructor(value?: string);
    /**
     *
     * @param {StatusStrings} value
     */
    set status(value: any);
    /**
     * @return {StatusStrings}
     */
    get status(): any;
}
export { Status };
//# sourceMappingURL=Status.d.ts.map