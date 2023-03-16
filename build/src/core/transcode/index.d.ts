export const TranscodeBot: {
    generateTranscode(inputPath: any, options: any): {
        command: null;
        output: any;
        run(callback: any, cancelToken: any): Promise<any>;
    };
    generateTranscodeSet(metaFiles: MetaFile[], options: any): {
        transcodes: any;
        runOne(transcode: any): Promise<any>;
        run(): Promise<any>;
        addListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        on(eventName: string | symbol, listener: (...args: any[]) => void): any;
        once(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        off(eventName: string | symbol, listener: (...args: any[]) => void): any;
        removeAllListeners(event?: string | symbol | undefined): any;
        setMaxListeners(n: number): any;
        getMaxListeners(): number;
        listeners(eventName: string | symbol): Function[];
        rawListeners(eventName: string | symbol): Function[];
        emit(eventName: string | symbol, ...args: any[]): boolean;
        listenerCount(eventName: string | symbol): number;
        prependListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        prependOnceListener(eventName: string | symbol, listener: (...args: any[]) => void): any;
        eventNames(): (string | symbol)[];
    };
    generateThumbnails(inputPath: any, options: any): Promise<{
        id: string;
        label: string;
        data: string;
    }[]>;
};
//# sourceMappingURL=index.d.ts.map