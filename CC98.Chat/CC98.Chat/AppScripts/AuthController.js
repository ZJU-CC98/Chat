// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
var AuthController = (function () {
    function AuthController($rootScope, $location, $window, $cc98Authorization) {
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$window = $window;
        this.$cc98Authorization = $cc98Authorization;
        // 执行核心方法
        this.handleCore();
    }
    /**
     * 处理 OAuth 回调的核心服务。
     */
    AuthController.prototype.handleCore = function () {
        var _this = this;
        // 哈希字符串
        var hash = this.$location.hash();
        // 分解数据
        var data = Utility.deparam(hash);
        var accessToken = data['access_token'];
        var tokenType = data['token_type'];
        // state 保存了跳转地址信息
        this.returnUrl = data['state'];
        if (accessToken && tokenType) {
            console.info('成功从 Hash 中提取了授权令牌信息。');
        }
        // 监听事件
        this.$rootScope.$on(Events.logOnEnd, function (event, isSucceeded) { return _this.handleUserLogOnChanged(isSucceeded); });
        // 尝试设置令牌信息。
        this.$cc98Authorization.trySetTokenInfo(accessToken, tokenType);
    };
    ;
    /**
     * 处理登录成功事件
     * @param event 事件对象。
     */
    AuthController.prototype.handleUserLogOnChanged = function (isSucceeded) {
        console.debug('正在重定向到 %s', this.returnUrl);
        // 删除凭据
        this.$location.hash('');
        // 跳转到新页面
        this.$location.path(this.returnUrl);
    };
    return AuthController;
}());
//# sourceMappingURL=AuthController.js.map