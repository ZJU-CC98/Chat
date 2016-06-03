// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 创建新讨论组使用的控制器。
 */
var CreateGroupController = (function () {
    function CreateGroupController($window, $location, $scope, $signalR, $systemMessage) {
        this.$window = $window;
        this.$location = $location;
        this.$scope = $scope;
        this.$signalR = $signalR;
        this.$systemMessage = $systemMessage;
    }
    /**
     * 执行创建操作。
     */
    CreateGroupController.prototype.create = function () {
        var _this = this;
        if (this.$signalR.isConnected) {
            // 执行服务器端方法
            this.$signalR.messageHub.server.createGroup(this.name, this.title, this.description).done(function () {
                _this.$systemMessage.showMessage('创建讨论组成功。');
                // 跳转地址
                _this.$location.path(Utility.stringFormat('/Group/{0}', encodeURIComponent(_this.name)));
                // 清除数据
                _this.clear();
            }).fail(function (data) {
                _this.$systemMessage.showMessage(Utility.stringFormat('创建讨论组失败：{0}', data));
            });
        }
        else {
            console.error('SignalR 未连接，不能执行创建操作。');
        }
    };
    /**
     * 清除所有现有数据。
     */
    CreateGroupController.prototype.clear = function () {
        this.name = null;
        this.title = null;
        this.description = null;
    };
    return CreateGroupController;
}());
//# sourceMappingURL=ChatGroupController.js.map