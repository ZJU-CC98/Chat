// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX


/**
 * 定义构造方法类型。
 */
type ctorFunction = new (...args: any[]) => any;

/**
 * 定义字典类型。
 */
type Dictionary<TValue> = {
    [key: string]: TValue;
}

/**
 * 定义字符串字典类型
 */
type StringDictionary = {
    [name: string]: string;
};