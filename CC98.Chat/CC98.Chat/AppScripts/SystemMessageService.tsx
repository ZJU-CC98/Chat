// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 提供关键消息的显示服务。
 */
class SystemMessageService {

    private $rootScope: ng.IRootScopeService;

    /**
     * 公共构造方法
     */
    public constructor($rootScope) {
        console.debug('正在初始化消息服务 ...');
        this.$rootScope = $rootScope;
    }

    /**
     * 在系统中显示一条消息。
     * @param message 要显示的消息。
     */
    showMessage(message: string) {

        // 在控制台输出消息
        console.log(Utility.stringFormat('准备显示消息: {0}', message));

        // 广播消息
        this.$rootScope.$broadcast(Events.systemMessage, message);
    }
};