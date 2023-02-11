type BlockchainBlock = {
    uuid: string;
    hash: string;
    content: string;
    timestamp: number;
};
declare class Blockchain {
    #private;
    /**
     * @param options
     */
    constructor(options?: {
        init?: string;
        chain?: Blockchain;
    });
    rebuild(chain: any): void;
    verify(): any;
    add(content: any): void;
    get(uuid: string): Object | null;
    get start(): any;
    get last(): any;
    get blocks(): BlockchainBlock[];
}
export default Blockchain;
//# sourceMappingURL=Blockchain.d.ts.map