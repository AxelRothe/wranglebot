export default interface createTaskOptions {
    label: string;
    source: string;
    matchExpression?: string;
    types?: string[];
    destinations: string[];
    settings?: {
        preserveFolderStructure?: boolean;
        createSubFolder?: boolean;
    };
}
//# sourceMappingURL=createTaskOptions.d.ts.map