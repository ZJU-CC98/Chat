// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 提供事件相关的功能和辅助变量。
 */
var Events;
(function (Events) {
    /**
     * 登录结束事件的名称。该字段为常量。
     */
    Events.logOnEnd = 'logOnEnd';
    /**
     * 服务器连接结束事件的名称。该字段为常量。
     */
    Events.serverConnectEnd = 'serverConnectEnd';
    /**
     * 用户信息更新事件。该字段为常量。
     */
    Events.userInfoUpdated = 'userInfoUpdated';
    /**
     * 系统消息事件。该字段为常量。
     */
    Events.systemMessage = 'systemMessage';
    /**
     * 切换演示模式。
     */
    Events.togglePresentationMode = 'togglePresentationMode';
    /**
     * 设置展示数据
     */
    Events.setPresentationData = 'setPresentationData';
})(Events || (Events = {}));
//# sourceMappingURL=Events.js.map