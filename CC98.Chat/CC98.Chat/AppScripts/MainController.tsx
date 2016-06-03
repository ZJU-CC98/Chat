// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 首页的控制器方法。
 */
class MainController {


    private $rootScope: ng.IRootScopeService;
    private $scope: ng.IScope;
    private $timeout: ng.ITimeoutService;
    private $siteUri: string;

    /**
     * 是否处于演示模式。
     */
    private isPresentationMode = false;
    /**
     * 当前组名称。
     */
    private groupName: string = null;
    /**
     * 当前组标题。
     */
    private title: string = null;

    /**
     * 错误消息列表。
     */
    private errors: string[] = new Array();

    public constructor($siteUri, $rootScope, $scope, $timeout) {

        this.$siteUri = $siteUri;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;

        // 控制系统消息
        this.$rootScope.$on(Events.systemMessage, (event, message) => this.handleNewSystemMessage(message));
        this.$rootScope.$on(Events.togglePresentationMode, (event, isPresentationMode) => this.handleTogglePresentationModeEvent(isPresentationMode));
        this.$rootScope.$on(Events.setPresentationData, (event, groupName, title) => {
            this.groupName = groupName;
            this.title = title;
        });

        this.updateUI();
    }

    /**
     * 处理演示模式切换消息。
     * @param isPresentationMode 是否进入演示模式。
     */
    private handleTogglePresentationModeEvent(isPresentationMode) {
        this.isPresentationMode = isPresentationMode;
        this.$scope.$apply('isPresentationMode');
        this.updateUI();
    }

    /**
     * 获取该演示组的显示连接。
     * @returns {string} 演示组的显示连接地址。
     */
    get displayLink() {
        return Utility.combineUri(this
            .$siteUri,
            Utility.stringFormat("/Group/{0}", encodeURIComponent(this.groupName)));
    }

    /**
     * 更新用户界面。
     */
    private updateUI() {
    };

    /**
     * 处理新错误消息。
     * @param message 要添加的错误消息。
     */
    private handleNewSystemMessage(message: string) {
        this.errors.push(message);
        this.$scope.$apply('errors');

        // 三秒钟后消除错误
        this.$timeout(() => {
            this.errors.splice(0, 1);
        }, 2000, true);
    };
}