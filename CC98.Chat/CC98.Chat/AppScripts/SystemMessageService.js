// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 提供关键消息的显示服务。
 */
var SystemMessageService = (function () {
    /**
     * 公共构造方法
     */
    function SystemMessageService($rootScope) {
        console.debug('正在初始化消息服务 ...');
        this.$rootScope = $rootScope;
    }
    /**
     * 在系统中显示一条消息。
     * @param message 要显示的消息。
     */
    SystemMessageService.prototype.showMessage = function (message) {
        // 在控制台输出消息
        console.log(Utility.stringFormat('准备显示消息: {0}', message));
        // 广播消息
        this.$rootScope.$broadcast(Events.systemMessage, message);
    };
    return SystemMessageService;
}());
;
//# sourceMappingURL=SystemMessageService.js.map