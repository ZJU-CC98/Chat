// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 首页的控制器方法。
 */
var MainController = (function () {
    function MainController($siteUri, $rootScope, $scope, $timeout) {
        var _this = this;
        /**
         * 是否处于演示模式。
         */
        this.isPresentationMode = false;
        /**
         * 当前组名称。
         */
        this.groupName = null;
        /**
         * 当前组标题。
         */
        this.title = null;
        /**
         * 错误消息列表。
         */
        this.errors = new Array();
        this.$siteUri = $siteUri;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        // 控制系统消息
        this.$rootScope.$on(Events.systemMessage, function (event, message) { return _this.handleNewSystemMessage(message); });
        this.$rootScope.$on(Events.togglePresentationMode, function (event, isPresentationMode) { return _this.handleTogglePresentationModeEvent(isPresentationMode); });
        this.$rootScope.$on(Events.setPresentationData, function (event, groupName, title) {
            _this.groupName = groupName;
            _this.title = title;
        });
        this.updateUI();
    }
    /**
     * 处理演示模式切换消息。
     * @param isPresentationMode 是否进入演示模式。
     */
    MainController.prototype.handleTogglePresentationModeEvent = function (isPresentationMode) {
        this.isPresentationMode = isPresentationMode;
        this.$scope.$apply('isPresentationMode');
        this.updateUI();
    };
    Object.defineProperty(MainController.prototype, "displayLink", {
        /**
         * 获取该演示组的显示连接。
         * @returns {string} 演示组的显示连接地址。
         */
        get: function () {
            return Utility.combineUri(this.$siteUri, Utility.stringFormat('/Group/{0}', encodeURIComponent(this.groupName)));
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 更新用户界面。
     */
    MainController.prototype.updateUI = function () {
    };
    ;
    /**
     * 处理新错误消息。
     * @param message 要添加的错误消息。
     */
    MainController.prototype.handleNewSystemMessage = function (message) {
        var _this = this;
        this.errors.push(message);
        this.$scope.$apply('errors');
        // 三秒钟后消除错误
        this.$timeout(function () {
            _this.errors.splice(0, 1);
        }, 2000, true);
    };
    ;
    return MainController;
}());
//# sourceMappingURL=MainController.js.map