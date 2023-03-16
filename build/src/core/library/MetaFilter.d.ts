export class MetaFilter {
    constructor(filterExpressions: any);
    filters: any[];
    filter(metaFiles: any): any;
    match(file: any, filter: any): boolean | RegExpMatchArray | null;
}
export class FilterExpression {
    constructor(key: any, expression: any);
    key: any;
    expression: any;
}
//# sourceMappingURL=MetaFilter.d.ts.map