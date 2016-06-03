// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 聊天页面控制器。
 */
var ChatController = (function () {
    function ChatController($routeParams, $scope, $rootScope, $window, $cc98Authorization, $cc98UserInfo, $signalR, $systemMessage) {
        var _this = this;
        /**
         * 聊天组信息。
         */
        this.chatGroupInfo = null;
        /**
         * 新消息的内容。
         */
        this.newMessage = null;
        /**
         * 当前用户是否登陆。
         */
        this.isLoggedOn = false;
        /**
         * 当前用户信息。
         */
        this.myInfo = null;
        /**
         * 当前用户的详细信息。
         */
        this.myUserInfo = null;
        /**
         * 是否处于演示模式。
         */
        this.isPresentationMode = false;
        /**
         * 成员列表
         */
        this.members = {};
        /**
         * 要显示的聊天消息。
         */
        this.messages = new Array();
        /**
         * 聊天组名称。
         */
        this.groupName = null;
        console.debug('正在初始化聊天控制器...');
        this.$routeParams = $routeParams;
        this.$scope = $scope;
        this.$rootScope = $rootScope;
        this.$window = $window;
        this.$cc98Authorization = $cc98Authorization;
        this.$cc98UserInfo = $cc98UserInfo;
        this.$signalR = $signalR;
        this.$systemMessage = $systemMessage;
        this.bindHubEvents();
        // 获取分组名称
        this.groupName = $routeParams['groupName'];
        $scope.$on(Events.serverConnectEnd, function () { return _this.handleServerConnectEndEvent(); });
        $scope.$on(Events.userInfoUpdated, function () { return _this.handleUserInfoUpdatedEvent(); });
        $scope.$on(Events.togglePresentationMode, function (event, isPresentationMode) { return _this.handleTogglePresentationModeEvent(isPresentationMode); });
        if (!this.$cc98Authorization.tryAutoLogOn()) {
            this.$signalR.start();
        }
        // 跟踪用户登录信息。
        $scope.$on(Events.logOnEnd, function () { return _this.handleLogOnEvent(); });
    }
    Object.defineProperty(ChatController.prototype, "displayTitle", {
        /**
         * 获取聊天组的显示标题。
         * @returns {}
         */
        get: function () {
            if (this.chatGroupInfo === null || this.chatGroupInfo === undefined) {
                return this.groupName;
            }
            if (this.chatGroupInfo.title === null || this.chatGroupInfo.title === '') {
                return this.chatGroupInfo.name;
            }
            else {
                return this.chatGroupInfo.title;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 处理模式更改事件。
     * @param isPresentationMode 是否切换到演示模式。
     */
    ChatController.prototype.handleTogglePresentationModeEvent = function (isPresentationMode) {
        this.isPresentationMode = isPresentationMode;
        this.$scope.$apply('isPresentationMode');
    };
    /**
     * 发送新消息。
     * @returns {}
     */
    ChatController.prototype.sendNewMessage = function () {
        var _this = this;
        if (this.$signalR.isConnected) {
            // 发送消息
            this.$signalR.messageHub.server.sendGroupMessage(this.groupName, this.newMessage).done(function () {
                // 清空
                _this.newMessage = null;
                _this.$scope.$apply('newMessage');
            }).fail(function () { });
        }
    };
    /**
     * 处理用户信息更改事件
     */
    ChatController.prototype.handleUserInfoUpdatedEvent = function () {
    };
    /**
     * 绑定 SignalR 事件。
     */
    ChatController.prototype.bindHubEvents = function () {
        var _this = this;
        var client = this.$signalR.messageHub.client;
        client.userEnterGroup = function (groupName, userName) { return _this.handleUserEnterGroupMessage(groupName, userName); };
        client.userExitGroup = function (groupName, userName) { return _this.handleUserExitGroupMessage(userName, groupName); };
        client.newGroupMessage = function (groupName, userName, content) { return _this.handleNewGroupMessage(groupName, userName, content); };
    };
    /**
     * 处理用户离开讨论组事件。
     * @param groupName 组名称。
     * @param userName 用户名称。
     */
    ChatController.prototype.handleUserExitGroupMessage = function (groupName, userName) {
        console.debug('接收到用户离开讨论组消息，组名 = %s, 用户名e = %s', groupName, userName);
        // 不是当前组则不进行任何操作。
        if (groupName !== this.groupName) {
            return;
        }
        if (Utility.hasValue(userName)) {
            // 删除用户
            delete this.members[userName];
            this.$scope.$apply('members');
            this.$scope.$apply('hasMembers');
            this.$systemMessage.showMessage(Utility.stringFormat('用户 {0} 离开了讨论组。', userName));
        }
        else {
            this.$systemMessage.showMessage('一位来宾离开了讨论组。');
        }
    };
    ;
    /**
     * 处理用户进入讨论组操作。
     * @param groupName 组名称。
     * @param userName 用户名称。
     */
    ChatController.prototype.handleUserEnterGroupMessage = function (groupName, userName) {
        console.debug('接收到用户进入讨论组消息，组名 = %s, 用户名 = %s', groupName, userName);
        // 不是当前组则不进行任何操作。
        if (groupName !== this.groupName) {
            return;
        }
        // 是否具有有效用户名。
        if (Utility.hasValue(userName)) {
            // 追加用户信息
            this.members[userName] = this.$cc98UserInfo.pickUserInfo(userName);
            this.$scope.$apply('members');
            this.$scope.$apply('hasMembers');
            this.$systemMessage.showMessage(Utility.stringFormat('用户 {0} 进入了讨论组。', userName));
        }
        else {
            this.$systemMessage.showMessage('一位来宾进入了讨论组。');
        }
    };
    ;
    /**
     * 处理新发言事件。
     * @param groupName 组名称。
     * @param userName 用户名称。
     * @param content 发言内容。
     */
    ChatController.prototype.handleNewGroupMessage = function (groupName, userName, content) {
        console.debug('接收到新的发言，组名 = %s, 用户名 = %s, 内容 = %s', groupName, userName, content);
        if (groupName === this.groupName) {
            var newMessage = new Message();
            newMessage.time = new Date();
            newMessage.user = this.$cc98UserInfo.pickUserInfo(userName);
            newMessage.content = content;
            // 判断是否为当前用户发言，并设置对应的类型
            if (this.myInfo !== null && userName === this.myInfo.name) {
                newMessage.messageType = MessageType.Me;
            }
            else {
                newMessage.messageType = MessageType.Others;
            }
            // 滚动消息
            $('#scrollable2').animate({ scrollTop: $('.container').height() }, 1000);
            // 插入数据并推送通知
            this.messages.push(newMessage);
            this.$scope.$apply('messages');
        }
    };
    ;
    Object.defineProperty(ChatController.prototype, "isAdmin", {
        /**
         * 获取一个值，指示当前用户是否是管理员。
         * @returns {boolean} 如果当前用户是管理员，返回 true；否则返回 false。
         */
        get: function () {
            // 信息不完整
            if (this.chatGroupInfo === null || this.myInfo === null) {
                return false;
            }
            var hasAdminRoles = false;
            // 管理员特权
            $.each(this.myInfo.roles, function (index, value) {
                if (value.toLowerCase() === 'administrators') {
                    hasAdminRoles = true;
                }
            });
            return hasAdminRoles || (this.chatGroupInfo.managerName.toLowerCase() === this.myInfo.name.toLowerCase());
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 将所有消息组合成字符串。
     */
    ChatController.prototype.generateMessageString = function () {
        // TODO: 增强性能
        var data = '';
        $.each(this.messages, function (index, value) {
            var item = Utility.stringFormat('作者：{0}\r\n时间：{1}\r\n内容：{2}\r\n\r\n', value.time, value.user.name, value.content);
            data += item;
        });
        return data;
    };
    ;
    /**
     * 保存所有消息。
     */
    ChatController.prototype.save = function () {
        var data = this.generateMessageString();
        if (this.$window.clipboardData.setData('Text', data)) {
            alert('内容已经成功复制到剪贴板。');
        }
        else {
            alert('无法将内容复制到剪贴板，请确保你的浏览器没有阻止网站访问剪贴板。');
        }
    };
    /**
     * 尝试加入聊天组。
     */
    ChatController.prototype.tryEnterGroup = function () {
        console.debug('尝试进入聊天组...');
        this.$signalR.messageHub.server.enterGroup(this.groupName).done(function () {
            console.info('进入聊天组成功。');
        }).fail(function () {
            console.warn('进入聊天组失败');
        });
    };
    ;
    /**
     * 执行连接后操作。
     */
    ChatController.prototype.executePostConnect = function () {
        this.loadChatInfo();
        this.tryEnterGroup();
    };
    ;
    /**
     * 处理 SignalR 服务器更改事件。
     */
    ChatController.prototype.handleServerConnectEndEvent = function () {
        if (this.$signalR.isConnected) {
            this.executePostConnect();
        }
    };
    /**
     * 处理登录事件。
     */
    ChatController.prototype.handleLogOnEvent = function () {
        this.$signalR.start();
        this.updateMyInfo();
        this.$scope.$apply('isLoggeOn');
        this.$scope.$apply('myInfo');
        this.$scope.$apply('myUserInfo');
        this.$scope.$apply('isAdmin');
    };
    ;
    /**
     * 执行登录。
     */
    ChatController.prototype.logOn = function () {
        // 回调地址
        var returnUrl = Utility.stringFormat('/Group/{0}', encodeURIComponent(this.groupName));
        this.$cc98Authorization.logOn(returnUrl);
    };
    ;
    /**
     * 更新用户信息。
     */
    ChatController.prototype.updateMyInfo = function () {
        this.isLoggedOn = this.$cc98Authorization.isLoggedOn;
        this.myInfo = this.$cc98Authorization.myInfo;
        // 更新用户个人信息
        if (this.myInfo !== null) {
            this.myUserInfo = this.$cc98UserInfo.pickUserInfo(this.myInfo.name);
        }
        else {
            this.myUserInfo = null;
        }
    };
    ;
    /**
     * 关闭讨论组
     */
    ChatController.prototype.closeGroup = function () {
        var _this = this;
        this.$signalR.messageHub.server.destroyGroup(this.groupName).done(function () {
            // 关闭对话框
            _this.$window.close();
        }).fail(function () {
        });
    };
    ;
    /**
     * 切换演示模式。
     */
    ChatController.prototype.togglePresentationMode = function () {
        CC98Chat.isPresentationMode = !CC98Chat.isPresentationMode;
        if (CC98Chat.isPresentationMode) {
            $('#scrollable2').css('overflow-y', 'hidden');
        }
        else {
            $('#scrollable2').css('overflow-y', 'scroll');
        }
        this.$rootScope.$broadcast(Events.togglePresentationMode, CC98Chat.isPresentationMode);
    };
    ;
    /**
     * 加载聊天组信息。
     */
    ChatController.prototype.loadChatInfo = function () {
        var _this = this;
        console.debug('开始加载聊天组信息...');
        if (this.$signalR.isConnected) {
            this.$signalR.messageHub.server.getGroup(this.groupName).done(function (data) {
                console.info('加载聊天组信息成功。');
                _this.chatGroupInfo = data;
                _this.$rootScope.$broadcast(Events.setPresentationData, _this.groupName, _this.displayTitle);
                _this.$scope.$apply('chatGroupInfo');
                _this.$scope.$apply('displayTitle');
                _this.$scope.$apply('isAdmin');
                _this.syncUserInfo();
            }).fail(function () {
                console.warn('加载聊天组信息失败。');
            });
        }
    };
    ;
    /**
     * 同步用户信息。
     * @returns {}
     */
    ChatController.prototype.syncUserInfo = function () {
        var _this = this;
        // 新的用户字典
        var result = {};
        // 逐个添加
        $.each(this.chatGroupInfo.members, function (index, value) {
            result[value.name] = _this.$cc98UserInfo.pickUserInfo(value.name);
        });
        this.members = result;
        // 刷新界面
        this.$scope.$apply('members');
        this.$scope.$apply('hasMembers');
    };
    ;
    Object.defineProperty(ChatController.prototype, "hasMembers", {
        /**
         * 获取一个值，指示当前聊天组中是否具有任何用户。
         */
        get: function () {
            return !Utility.isEmpty(this.members);
        },
        enumerable: true,
        configurable: true
    });
    return ChatController;
}());
//# sourceMappingURL=ChatController.js.map