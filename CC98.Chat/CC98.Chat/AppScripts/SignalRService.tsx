// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/// <reference path="Hubs.tsx"/>
class SignalRService {

    private $rootScope: ng.IRootScopeService;
    private $cc98Authorizaion: CC98AuthorizationService;
    private $apiUri : string;

    /**
     * SignalR 服务对象。
     */
    private signalR: SignalR;

    /**
     * 是否连接的内部字段。
     */
    private isConnectedInternal = false;

    public constructor($apiUri, $rootScope, $cc98Authorization) {

        console.debug('正在初始化 SignalR 服务 ...');

        this.$apiUri = $apiUri;
        this.$rootScope = $rootScope;
        this.$cc98Authorizaion = $cc98Authorization;
        this.signalR = $.connection;

        this.initializeHub();
        //监听登录事件
        this.$rootScope.$on(Events.logOnEnd, () => this.handleLogOnEvent());
    }

    /**
     * 处理用户凭据更改事件。
     * @returns {}
     */
    private handleLogOnEvent() {
        // 获取当前用户信息
        var userInfo = this.$cc98Authorizaion.myInfo;
        // 如果已经登录
        if (this.$cc98Authorizaion.isLoggedOn) {
        }
    };

    /**
     * 获取消息集线器对象。
     * @returns {} 
     */
    get messageHub() {
        return this.signalR.messageHub;
    }

    /**
     * 获取一个值，指示当前系统是否已经连接到服务器。
     */
    get isConnected() {
        return this.isConnectedInternal;
    }

    /// 设置 SignalR 用户凭据。
    private setUserAuthorization() {
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

    /**
     * 设置集线器的所有必要参数。
     */
    private initializeHub() {
        // API 地址
        this.signalR.hub.url = Utility.combineUri(this.$apiUri, '/signalR');
        // 绑定断开事件
        this.signalR.hub.disconnected(() => this.handleDisconnnected());
    }

    /**
     * 启动 SignalR 连接。
     */
    start() {

        // 如果不是断开状态，则强制断开
        if (this.signalR.hub.state !== SignalR.ConnectionState.Disconnected) {
            this.signalR.hub.stop();
        }

        // 设置用户凭据
        this.setUserAuthorization();

        // 启动连接
        $.connection.hub.start().done(() => {
            console.debug('已经连接到服务器。');
            this.isConnectedInternal = true;
            this.$rootScope.$broadcast(Events.serverConnectEnd, true);
        }).fail(() => {
            console.debug('连接服务器失败');
            this.isConnectedInternal = false;
            this.$rootScope.$broadcast(Events.serverConnectEnd, false);
        });
    }

    /**
     * 处理 SignalR 断开事件。
     */
    private handleDisconnnected() {
        this.$rootScope.$broadcast('serverDisconnected');
    }

    /**
     * 确保 SignalR 能够正常工作之后执行特定方法。
     * @param fn 要执行的方法。
     */
    private run(fn) {
        // 已连接则直接执行
        if (this.isConnected) {
            fn();
        }
        // 否则，启动连接并在链接成功后执行
        else {
            this.$rootScope.$on(Events.serverConnectEnd, isConnected => {
                if (isConnected) {
                    fn();
                }
            });
            this.start();
        }
    };
};