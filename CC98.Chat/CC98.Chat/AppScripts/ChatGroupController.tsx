// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 创建新讨论组使用的控制器。
 */
class CreateGroupController {

    private $window: ng.IWindowService;
    private $location: ng.ILocationService;
    private $scope: ng.IScope;
    private $signalR: SignalRService;
    private $systemMessage: SystemMessageService;

    /**
     * 讨论组名称。
     */
    name: string;
    /**
     * 讨论组标题。
     */
    title: string;
    /**
     * 讨论组描述。
     */
    description: string;

    public constructor($window, $location, $scope, $signalR, $systemMessage) {
        this.$window = $window;
        this.$location = $location;
        this.$scope = $scope;
        this.$signalR = $signalR;
        this.$systemMessage = $systemMessage;
    }

    /**
     * 执行创建操作。
     */
    create() {
        if (this.$signalR.isConnected) {
            // 执行服务器端方法
            this.$signalR.messageHub.server.createGroup(this.name, this.title, this.description).done(() => {
                this.$systemMessage.showMessage('创建讨论组成功。');
                // 跳转地址
                this.$location.path(Utility.stringFormat('/Group/{0}', encodeURIComponent(this.name)));
                // 清除数据
                this.clear();
            }).fail(data => {
                this.$systemMessage.showMessage(Utility.stringFormat('创建讨论组失败：{0}', data));
            });
        }
        else {
            console.error('SignalR 未连接，不能执行创建操作。');
        }
    }

    /**
     * 清除所有现有数据。
     */
    clear() {
        this.name = null;
        this.title = null;
        this.description = null;
    }
}