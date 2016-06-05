// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path="Hubs.tsx"/>
var SignalRService = (function () {
    function SignalRService($apiUri, $rootScope, $cc98Authorization) {
        var _this = this;
        /**
         * 是否连接的内部字段。
         */
        this.isConnectedInternal = false;
        console.debug('正在初始化 SignalR 服务 ...');
        this.$apiUri = $apiUri;
        this.$rootScope = $rootScope;
        this.$cc98Authorizaion = $cc98Authorization;
        this.signalR = $.connection;
        this.initializeHub();
        //监听登录事件
        this.$rootScope.$on(Events.logOnEnd, function () { return _this.handleLogOnEvent(); });
    }
    /**
     * 处理用户凭据更改事件。
     * @returns {}
     */
    SignalRService.prototype.handleLogOnEvent = function () {
        // 获取当前用户信息
        var userInfo = this.$cc98Authorizaion.myInfo;
        // 如果已经登录
        if (this.$cc98Authorizaion.isLoggedOn) {
        }
    };
    ;
    Object.defineProperty(SignalRService.prototype, "messageHub", {
        /**
         * 获取消息集线器对象。
         * @returns {}
         */
        get: function () {
            return this.signalR.messageHub;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignalRService.prototype, "isConnected", {
        /**
         * 获取一个值，指示当前系统是否已经连接到服务器。
         */
        get: function () {
            return this.isConnectedInternal;
        },
        enumerable: true,
        configurable: true
    });
    /// 设置 SignalR 用户凭据。
    SignalRService.prototype.setUserAuthorization = function () {
        // 如果用户已经登录，则设置字符串
        if (this.$cc98Authorizaion.isLoggedOn) {
            this.signalR.hub.qs = {
                'Authorization': Utility.stringFormat('{0} {1}', this.$cc98Authorizaion.tokenType, this.$cc98Authorizaion.accessToken)
            };
        }
        else {
            this.signalR.hub.qs = {};
        }
    };
    ;
    /**
     * 设置集线器的所有必要参数。
     */
    SignalRService.prototype.initializeHub = function () {
        var _this = this;
        // API 地址
        var realUrl = Utility.combineUri(this.$apiUri, '/signalR');
        console.debug('正在配置 SignalR，地址 = %s', realUrl);
        this.signalR.hub.url = realUrl;
        // 绑定断开事件
        this.signalR.hub.disconnected(function () { return _this.handleDisconnnected(); });
    };
    /**
     * 启动 SignalR 连接。
     */
    SignalRService.prototype.start = function () {
        var _this = this;
        // 如果不是断开状态，则强制断开
        if (this.signalR.hub.state !== 4 /* Disconnected */) {
            this.signalR.hub.stop();
        }
        // 设置用户凭据
        this.setUserAuthorization();
        // 启动连接
        $.connection.hub.logging = true;
        $.connection.hub.start().done(function () {
            console.debug('已经连接到服务器。');
            _this.isConnectedInternal = true;
            _this.$rootScope.$broadcast(Events.serverConnectEnd, true);
        }).fail(function () {
            console.debug('连接服务器失败');
            _this.isConnectedInternal = false;
            _this.$rootScope.$broadcast(Events.serverConnectEnd, false);
        });
    };
    /**
     * 处理 SignalR 断开事件。
     */
    SignalRService.prototype.handleDisconnnected = function () {
        this.$rootScope.$broadcast('serverDisconnected');
    };
    /**
     * 确保 SignalR 能够正常工作之后执行特定方法。
     * @param fn 要执行的方法。
     */
    SignalRService.prototype.run = function (fn) {
        // 已连接则直接执行
        if (this.isConnected) {
            fn();
        }
        else {
            this.$rootScope.$on(Events.serverConnectEnd, function (isConnected) {
                if (isConnected) {
                    fn();
                }
            });
            this.start();
        }
    };
    ;
    return SignalRService;
}());
;
//# sourceMappingURL=SignalRService.js.map