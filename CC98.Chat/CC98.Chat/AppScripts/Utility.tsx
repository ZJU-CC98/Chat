// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 提供辅助方法
 */
module Utility {

    /**
     * 格式化字符串方法。
     * @param format 格式化字符串。
     * @param args 其他可选参数。
     * @returns {string} 格式化后的字符串。
     */
    export function stringFormat(format: string, ...args: any[]): string {
        return format.replace(/\{(\d+)\}/g, (_, index) => args[index]);
    }

    /**
     * 判断一个字符串是否具有实际值。
     * @param str 要判断的字符串。
     * @returns {boolean} 如果字符串值是 undefined、null 或者 ''，则返回 false。否则返回 true。
     */
    export function hasValue(str: string) {
        return str !== undefined && str !== null && str !== '';
    }

    /**
     * 获取一个值，指示字典对象是否为空。
     * @param obj 要判断的对象。
     * @returns {boolean} 如果该对象为空，返回 true；否则返回 false。
     */
    export function isEmpty(obj: any) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }

    /**
     * 获取一个强类型字典对象的所有值。
     * @param obj 包含若干个强类型属性值的字典对象。
     * @returns {T[]} 该对象中包含的所有值。
     */
    export function values(obj: any) {
        const propertyNames = Object.getOwnPropertyNames(obj);
        var result = new Array();
        $.each(propertyNames,
            (index, name) => {
                result.push(obj[name]);
            });
        return result;
    }

    /**
     * 合并两个 URL 部分。
     * @param baseUri 基础 URL。
     * @param path 需要合并的 URL 路径。
     */
    export function combineUri(baseUri: string, path: string) {
        // 归一化 BaseUri
        if (baseUri[baseUri.length - 1] !== '/') {
            baseUri += '/';
        }
        // 归一化 Path
        if (path[0] === '/') {
            path = path.substring(1);
        }
        return baseUri + path;
    }

    /**
     * 分解查询字符串并获得字典结构的数据。
     * @param query 要分解的强类型字符串。
     * @returns {} 使用字典形式保存的数据。
     */
    export function deparam(query: string): StringDictionary {
        var result: StringDictionary = {};
        const items = query.split('&');
        $.each(items, (i, str) => {
            var eqIndex = str.indexOf('=');
            var name: string;
            var value: string;
            if (eqIndex !== -1) {
                name = decodeURIComponent(str.substring(0, eqIndex));
                value = decodeURIComponent(str.substring(eqIndex + 1));
            }
            else {
                name = decodeURIComponent(str);
                value = null;
            }
            result[name] = value;
        });
        return result;
    }
}

/**
 * 扩展 Window 功能支持剪贴板
 */
interface Window {
    clipboardData: any;
}