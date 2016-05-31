// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 提供事件相关的功能和辅助变量。
 */
module Events {
    /**
     * 登录结束事件的名称。该字段为常量。
     */
    export const logOnEnd = 'logOnEnd';
    /**
     * 服务器连接结束事件的名称。该字段为常量。
     */
    export const serverConnectEnd = 'serverConnectEnd';
    /**
     * 用户信息更新事件。该字段为常量。
     */
    export const userInfoUpdated = 'userInfoUpdated';
    /**
     * 系统消息事件。该字段为常量。
     */
    export const systemMessage = 'systemMessage';
    /**
     * 切换演示模式。
     */
    export const togglePresentationMode = 'togglePresentationMode';
    /**
     * 设置展示数据
     */
    export const setPresentationData = 'setPresentationData';
}
