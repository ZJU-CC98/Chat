var AuthController = (function () {
    function AuthController($rootScope, $location, $window, $cc98Authorization) {
        this.$rootScope = $rootScope;
        this.$location = $location;
        this.$window = $window;
        this.$cc98Authorization = $cc98Authorization;
        this.handleCore();
    }
    AuthController.prototype.handleCore = function () {
        var _this = this;
        var hash = this.$location.hash();
        var data = Utility.deparam(hash);
        var accessToken = data['access_token'];
        var tokenType = data['token_type'];
        this.returnUrl = data['state'];
        if (accessToken && tokenType) {
            console.info('成功从 Hash 中提取了授权令牌信息。');
        }
        this.$rootScope.$on(Events.logOnEnd, function (event, isSucceeded) { return _this.handleUserLogOnChanged(isSucceeded); });
        this.$cc98Authorization.trySetTokenInfo(accessToken, tokenType);
    };
    ;
    AuthController.prototype.handleUserLogOnChanged = function (isSucceeded) {
        console.debug('正在重定向到 %s', this.returnUrl);
        this.$location.hash('');
        this.$location.path(this.returnUrl);
    };
    return AuthController;
}());
var CC98AuthorizationService = (function () {
    function CC98AuthorizationService($siteUri, $logonUri, $apiUri, $cc98ClientId, $window, $http, $rootScope) {
        this.accessTokenKey = 'access_token';
        this.tokenTypeKey = 'type';
        this.isLoggedOnInternal = false;
        this.myInfoInternal = null;
        console.debug('正在构建 CC98 身份认证服务...');
        this.$siteUri = $siteUri;
        this.$logonUri = $logonUri;
        this.$apiUri = $apiUri;
        this.$cc98ClientId = $cc98ClientId;
        this.$window = $window;
        this.$http = $http;
        this.$rootScope = $rootScope;
    }
    CC98AuthorizationService.prototype.buildOAuthRedirectUri = function (clientId, returnUrl) {
        var redirectUri = Utility.combineUri(this.$siteUri, '/Auth');
        var state = returnUrl;
        var authPath = Utility.stringFormat('/OAuth/Authorize?response_type=token&scope=getmessage* setmessage*&client_id={0}&redirect_uri={1}&state={2}', encodeURIComponent(clientId), encodeURIComponent(redirectUri), encodeURIComponent(state));
        return Utility.combineUri(this.$logonUri, authPath);
    };
    Object.defineProperty(CC98AuthorizationService.prototype, "accessToken", {
        get: function () {
            return this.accessTokenInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "tokenType", {
        get: function () {
            return this.tokenTypeInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "isLoggedOn", {
        get: function () {
            return this.isLoggedOnInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "myInfo", {
        get: function () {
            return this.myInfoInternal;
        },
        enumerable: true,
        configurable: true
    });
    CC98AuthorizationService.prototype.handleAccessToken = function () {
    };
    CC98AuthorizationService.prototype.saveTokenToStorage = function () {
        this.$window.localStorage[this.accessTokenKey] = this.accessTokenInternal;
        this.$window.localStorage[this.tokenTypeKey] = this.tokenTypeInternal;
    };
    CC98AuthorizationService.prototype.loadTokenFromStorage = function () {
        this.accessTokenInternal = this.$window.localStorage[this.accessTokenKey];
        this.tokenTypeInternal = this.$window.localStorage[this.tokenTypeKey];
        return this.accessTokenInternal !== null && this.tokenTypeInternal !== null;
    };
    CC98AuthorizationService.prototype.loadMyInfoUsingToken = function () {
        var me = this;
        console.debug('try loading user info from token...');
        var requsetConfig = {
            headers: {
                'Authorization': Utility.stringFormat('{0} {1}', this.tokenTypeInternal, this.accessTokenInternal)
            }
        };
        this.$http.get(Utility.combineUri(this.$apiUri, '/Me/Basic'), requsetConfig).success(function (data, status, headers, config) {
            me.isLoggedOnInternal = true;
            me.myInfoInternal = data;
            me.saveTokenToStorage();
            me.$rootScope.$broadcast(Events.logOnEnd, true);
            console.info('succeessfully loaded user info.');
        }).error(function () {
            me.$rootScope.$broadcast(Events.logOnEnd, false);
            console.warn('error loading user info.');
        });
    };
    CC98AuthorizationService.prototype.trySetTokenInfo = function (accessToken, tokenType) {
        console.debug('正在设置用户令牌 ...');
        this.accessTokenInternal = accessToken;
        this.tokenTypeInternal = tokenType;
        this.loadMyInfoUsingToken();
    };
    CC98AuthorizationService.prototype.handleCallback = function () {
        var params = {};
        var accessToken = params[this.accessTokenKey];
        var tokenType = params[this.tokenTypeKey];
        this.$window.localStorage[this.accessTokenKey] = accessToken;
        this.$window.localStorage[this.tokenTypeKey] = tokenType;
    };
    CC98AuthorizationService.prototype.tryAutoLogOn = function () {
        console.debug('正在尝试自动登录 ...');
        if (!this.loadTokenFromStorage()) {
            console.debug('找不到登录令牌信息');
            return false;
        }
        this.loadMyInfoUsingToken();
        return true;
    };
    CC98AuthorizationService.prototype.logOn = function (returnUrl) {
        this.$window.location.href = this.buildOAuthRedirectUri(this.$cc98ClientId, returnUrl);
    };
    CC98AuthorizationService.prototype.logOff = function () {
        this.isLoggedOnInternal = false;
        this.myInfoInternal = null;
    };
    ;
    return CC98AuthorizationService;
}());
var Utility;
(function (Utility) {
    function stringFormat(format) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return format.replace(/\{(\d+)\}/g, function (_, index) { return args[index]; });
    }
    Utility.stringFormat = stringFormat;
    function hasValue(str) {
        return str !== undefined && str !== null && str !== '';
    }
    Utility.hasValue = hasValue;
    function isEmpty(obj) {
        return Object.getOwnPropertyNames(obj).length === 0;
    }
    Utility.isEmpty = isEmpty;
    function values(obj) {
        var propertyNames = Object.getOwnPropertyNames(obj);
        var result = new Array();
        $.each(propertyNames, function (index, name) {
            result.push(obj[name]);
        });
        return result;
    }
    Utility.values = values;
    function combineUri(baseUri, path) {
        if (baseUri[baseUri.length - 1] !== '/') {
            baseUri += '/';
        }
        if (path[0] === '/') {
            path = path.substring(1);
        }
        return baseUri + path;
    }
    Utility.combineUri = combineUri;
    function deparam(query) {
        var result = {};
        var items = query.split('&');
        $.each(items, function (i, str) {
            var eqIndex = str.indexOf('=');
            var name;
            var value;
            if (eqIndex !== -1) {
                name = decodeURIComponent(str.substring(0, eqIndex));
                value = decodeURIComponent(str.substring(eqIndex + 1));
            }
            else {
                name = decodeURIComponent(str);
                value = null;
            }
            result[name] = value;
        });
        return result;
    }
    Utility.deparam = deparam;
})(Utility || (Utility = {}));
var Events;
(function (Events) {
    Events.logOnEnd = 'logOnEnd';
    Events.serverConnectEnd = 'serverConnectEnd';
    Events.userInfoUpdated = 'userInfoUpdated';
    Events.systemMessage = 'systemMessage';
    Events.togglePresentationMode = 'togglePresentationMode';
    Events.setPresentationData = 'setPresentationData';
})(Events || (Events = {}));
var UserInfo = (function () {
    function UserInfo() {
    }
    return UserInfo;
}());
var Message = (function () {
    function Message() {
    }
    return Message;
}());
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Others"] = 0] = "Others";
    MessageType[MessageType["Me"] = 1] = "Me";
    MessageType[MessageType["System"] = 2] = "System";
})(MessageType || (MessageType = {}));
var ChatGroupInfo = (function () {
    function ChatGroupInfo() {
        this.members = new Array();
    }
    return ChatGroupInfo;
}());
var CC98UserInfoService = (function () {
    function CC98UserInfoService($apiUri, $rootScope, $http) {
        this.userDic = {};
        this.$apiUri = $apiUri;
        this.$rootScope = $rootScope;
        this.$http = $http;
    }
    CC98UserInfoService.prototype.getUserInfoFromServer = function (userName) {
        var me = this;
        console.debug('正在尝试获取用户信息，用户名 = %s', userName);
        var url = Utility.combineUri(this.$apiUri, Utility.stringFormat('/user/name/{0}', encodeURIComponent(userName)));
        this.$http.get(url).success(function (data) {
            console.debug('成功获取用户信息，用户名 = %s', userName);
            var item = me.userDic[userName];
            item.name = data.name;
            item.id = data.id;
            item.portraitUrl = data.portraitUrl;
            me.$rootScope.$broadcast(Events.userInfoUpdated, item);
        }).error(function () {
            console.warn('获取用户信息失败，用户名 = %s', userName);
        });
    };
    CC98UserInfoService.prototype.pickUserInfo = function (userName) {
        console.debug('正在检索用户信息，用户名 = %s', userName);
        var item = this.userDic[userName];
        if (item) {
            return item;
        }
        item = new UserInfo();
        item.id = 0;
        item.name = userName;
        item.portraitUrl = null;
        this.userDic[userName] = item;
        this.getUserInfoFromServer(userName);
        return item;
    };
    return CC98UserInfoService;
}());
var SignalRService = (function () {
    function SignalRService($apiUri, $rootScope, $cc98Authorization) {
        var _this = this;
        this.isConnectedInternal = false;
        console.debug('正在初始化 SignalR 服务 ...');
        this.$apiUri = $apiUri;
        this.$rootScope = $rootScope;
        this.$cc98Authorizaion = $cc98Authorization;
        this.signalR = $.connection;
        this.initializeHub();
        this.$rootScope.$on(Events.logOnEnd, function () { return _this.handleLogOnEvent(); });
    }
    SignalRService.prototype.handleLogOnEvent = function () {
        var userInfo = this.$cc98Authorizaion.myInfo;
        if (this.$cc98Authorizaion.isLoggedOn) {
        }
    };
    ;
    Object.defineProperty(SignalRService.prototype, "messageHub", {
        get: function () {
            return this.signalR.messageHub;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SignalRService.prototype, "isConnected", {
        get: function () {
            return this.isConnectedInternal;
        },
        enumerable: true,
        configurable: true
    });
    SignalRService.prototype.setUserAuthorization = function () {
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
    SignalRService.prototype.initializeHub = function () {
        var _this = this;
        var realUrl = Utility.combineUri(this.$apiUri, '/signalR');
        console.debug('正在配置 SignalR，地址 = %s', realUrl);
        this.signalR.hub.url = realUrl;
        this.signalR.hub.disconnected(function () { return _this.handleDisconnnected(); });
    };
    SignalRService.prototype.start = function () {
        var _this = this;
        if (this.signalR.hub.state !== 4) {
            this.signalR.hub.stop();
        }
        this.setUserAuthorization();
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
    SignalRService.prototype.handleDisconnnected = function () {
        this.$rootScope.$broadcast('serverDisconnected');
    };
    SignalRService.prototype.run = function (fn) {
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
var SystemMessageService = (function () {
    function SystemMessageService($rootScope) {
        console.debug('正在初始化消息服务 ...');
        this.$rootScope = $rootScope;
    }
    SystemMessageService.prototype.showMessage = function (message) {
        console.log(Utility.stringFormat('准备显示消息: {0}', message));
        this.$rootScope.$broadcast(Events.systemMessage, message);
    };
    return SystemMessageService;
}());
;
var HomeController = (function () {
    function HomeController($scope, $signalR, $cc98Authorization) {
        var _this = this;
        this.isLoggedOn = false;
        this.groups = {};
        console.debug('正在进入首页控制器 ...');
        this.$scope = $scope;
        this.$signalR = $signalR;
        this.$cc98Authorization = $cc98Authorization;
        this.attachHubEvents();
        this.$scope.$on(Events.logOnEnd, function () { return _this.handleLogOnEvent(); });
        this.$scope.$on(Events.serverConnectEnd, function () { return _this.handleServerConnectEnd(); });
        if (!this.$cc98Authorization.tryAutoLogOn()) {
            $signalR.start();
        }
    }
    HomeController.prototype.handleServerConnectEnd = function () {
        console.debug('检测到服务器连接状态更改');
        this.syncGroups();
    };
    HomeController.prototype.handleLogOnEvent = function () {
        this.isLoggedOn = this.$cc98Authorization.isLoggedOn;
        this.$signalR.start();
    };
    HomeController.prototype.logOn = function () {
        this.$cc98Authorization.logOn('/Home');
    };
    HomeController.prototype.getDisplayTitle = function (group) {
        if (Utility.hasValue(group.title)) {
            return group.title;
        }
        else {
            return group.name;
        }
    };
    ;
    Object.defineProperty(HomeController.prototype, "hasGroups", {
        get: function () {
            return !Utility.isEmpty(this.groups);
        },
        enumerable: true,
        configurable: true
    });
    HomeController.prototype.syncGroups = function () {
        var _this = this;
        this.$signalR.messageHub.server.getGroups().done(function (data) {
            console.info('成功获取组信息，数量 = %d', data.length);
            var newGroups = {};
            $.each(data, function (index, value) {
                newGroups[value.name] = value;
            });
            _this.groups = newGroups;
            _this.$scope.$apply('groups');
            _this.$scope.$apply('hasGroups');
        }).fail(function () {
            console.warn('获取组信息时发生错误。');
        });
    };
    ;
    HomeController.prototype.handleGroupCreated = function (group) {
        console.debug('检测到创建新组');
        this.groups[group.name] = group;
        this.$scope.$apply('groups');
        this.$scope.$apply('hasGroups');
    };
    ;
    HomeController.prototype.handleGroupDestroyed = function (groupName) {
        console.debug('检测到组销毁');
        delete this.groups[groupName];
        this.$scope.$apply('groups');
        this.$scope.$apply('hasGroups');
    };
    ;
    HomeController.prototype.attachHubEvents = function () {
        var _this = this;
        this.$signalR.messageHub.client.groupCreated = function (group) { return _this.handleGroupCreated(group); };
        this.$signalR.messageHub.client.groupDestroyed = function (groupName) { return _this.handleGroupDestroyed(groupName); };
    };
    ;
    return HomeController;
}());
var MainController = (function () {
    function MainController($siteUri, $rootScope, $scope, $timeout) {
        var _this = this;
        this.isPresentationMode = false;
        this.groupName = null;
        this.title = null;
        this.errors = new Array();
        this.$siteUri = $siteUri;
        this.$rootScope = $rootScope;
        this.$scope = $scope;
        this.$timeout = $timeout;
        this.$rootScope.$on(Events.systemMessage, function (event, message) { return _this.handleNewSystemMessage(message); });
        this.$rootScope.$on(Events.togglePresentationMode, function (event, isPresentationMode) { return _this.handleTogglePresentationModeEvent(isPresentationMode); });
        this.$rootScope.$on(Events.setPresentationData, function (event, groupName, title) {
            _this.groupName = groupName;
            _this.title = title;
        });
        this.updateUI();
    }
    MainController.prototype.handleTogglePresentationModeEvent = function (isPresentationMode) {
        this.isPresentationMode = isPresentationMode;
        this.$scope.$apply('isPresentationMode');
        this.updateUI();
    };
    Object.defineProperty(MainController.prototype, "displayLink", {
        get: function () {
            return Utility.combineUri(this.$siteUri, Utility.stringFormat('/Group/{0}', encodeURIComponent(this.groupName)));
        },
        enumerable: true,
        configurable: true
    });
    MainController.prototype.updateUI = function () {
    };
    ;
    MainController.prototype.handleNewSystemMessage = function (message) {
        var _this = this;
        this.errors.push(message);
        this.$scope.$apply('errors');
        this.$timeout(function () {
            _this.errors.splice(0, 1);
        }, 2000, true);
    };
    ;
    return MainController;
}());
var ChatController = (function () {
    function ChatController($routeParams, $scope, $rootScope, $window, $cc98Authorization, $cc98UserInfo, $signalR, $systemMessage) {
        var _this = this;
        this.chatGroupInfo = null;
        this.newMessage = null;
        this.isLoggedOn = false;
        this.myInfo = null;
        this.myUserInfo = null;
        this.isPresentationMode = false;
        this.members = {};
        this.messages = new Array();
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
        this.groupName = $routeParams['groupName'];
        $scope.$on(Events.serverConnectEnd, function () { return _this.handleServerConnectEndEvent(); });
        $scope.$on(Events.userInfoUpdated, function () { return _this.handleUserInfoUpdatedEvent(); });
        $scope.$on(Events.togglePresentationMode, function (event, isPresentationMode) { return _this.handleTogglePresentationModeEvent(isPresentationMode); });
        if (!this.$cc98Authorization.tryAutoLogOn()) {
            this.$signalR.start();
        }
        $scope.$on(Events.logOnEnd, function () { return _this.handleLogOnEvent(); });
    }
    Object.defineProperty(ChatController.prototype, "displayTitle", {
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
    ChatController.prototype.handleTogglePresentationModeEvent = function (isPresentationMode) {
        this.isPresentationMode = isPresentationMode;
        this.$scope.$apply('isPresentationMode');
    };
    ChatController.prototype.sendNewMessage = function () {
        var _this = this;
        if (this.$signalR.isConnected) {
            this.$signalR.messageHub.server.sendGroupMessage(this.groupName, this.newMessage).done(function () {
                _this.newMessage = null;
                _this.$scope.$apply('newMessage');
            }).fail(function () { });
        }
    };
    ChatController.prototype.handleUserInfoUpdatedEvent = function () {
    };
    ChatController.prototype.bindHubEvents = function () {
        var _this = this;
        var client = this.$signalR.messageHub.client;
        client.userEnterGroup = function (groupName, userName) { return _this.handleUserEnterGroupMessage(groupName, userName); };
        client.userExitGroup = function (groupName, userName) { return _this.handleUserExitGroupMessage(userName, groupName); };
        client.newGroupMessage = function (groupName, userName, content) { return _this.handleNewGroupMessage(groupName, userName, content); };
    };
    ChatController.prototype.handleUserExitGroupMessage = function (groupName, userName) {
        console.debug('接收到用户离开讨论组消息，组名 = %s, 用户名e = %s', groupName, userName);
        if (groupName !== this.groupName) {
            return;
        }
        if (Utility.hasValue(userName)) {
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
    ChatController.prototype.handleUserEnterGroupMessage = function (groupName, userName) {
        console.debug('接收到用户进入讨论组消息，组名 = %s, 用户名 = %s', groupName, userName);
        if (groupName !== this.groupName) {
            return;
        }
        if (Utility.hasValue(userName)) {
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
    ChatController.prototype.handleNewGroupMessage = function (groupName, userName, content) {
        console.debug('接收到新的发言，组名 = %s, 用户名 = %s, 内容 = %s', groupName, userName, content);
        if (groupName === this.groupName) {
            var newMessage = new Message();
            newMessage.time = new Date();
            newMessage.user = this.$cc98UserInfo.pickUserInfo(userName);
            newMessage.content = content;
            if (this.myInfo !== null && userName === this.myInfo.name) {
                newMessage.messageType = MessageType.Me;
            }
            else {
                newMessage.messageType = MessageType.Others;
            }
            $('#scrollable2').animate({ scrollTop: $('.container').height() }, 1000);
            this.messages.push(newMessage);
            if (this.messages.length > 1000) {
                this.messages.shift();
            }
            this.$scope.$apply('messages');
        }
    };
    ;
    Object.defineProperty(ChatController.prototype, "isAdmin", {
        get: function () {
            if (this.chatGroupInfo === null || this.myInfo === null) {
                return false;
            }
            var hasAdminRoles = false;
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
    ChatController.prototype.generateMessageString = function () {
        var data = '';
        $.each(this.messages, function (index, value) {
            var item = Utility.stringFormat('时间：{0}\r\n作者：{1}\r\n内容：{2}\r\n\r\n', value.time, value.user.name, value.content);
            data += item;
        });
        return data;
    };
    ;
    ChatController.prototype.save = function () {
        var data = this.generateMessageString();
        if (this.$window.clipboardData.setData('Text', data)) {
            alert('内容已经成功复制到剪贴板。');
        }
        else {
            alert('无法将内容复制到剪贴板，请确保你的浏览器没有阻止网站访问剪贴板。');
        }
    };
    ChatController.prototype.tryEnterGroup = function () {
        console.debug('尝试进入聊天组...');
        this.$signalR.messageHub.server.enterGroup(this.groupName).done(function () {
            console.info('进入聊天组成功。');
        }).fail(function () {
            console.warn('进入聊天组失败');
        });
    };
    ;
    ChatController.prototype.executePostConnect = function () {
        this.loadChatInfo();
        this.tryEnterGroup();
    };
    ;
    ChatController.prototype.handleServerConnectEndEvent = function () {
        if (this.$signalR.isConnected) {
            this.executePostConnect();
        }
    };
    ChatController.prototype.handleLogOnEvent = function () {
        this.$signalR.start();
        this.updateMyInfo();
        this.$scope.$apply('isLoggeOn');
        this.$scope.$apply('myInfo');
        this.$scope.$apply('myUserInfo');
        this.$scope.$apply('isAdmin');
    };
    ;
    ChatController.prototype.logOn = function () {
        var returnUrl = Utility.stringFormat('/Group/{0}', encodeURIComponent(this.groupName));
        this.$cc98Authorization.logOn(returnUrl);
    };
    ;
    ChatController.prototype.updateMyInfo = function () {
        this.isLoggedOn = this.$cc98Authorization.isLoggedOn;
        this.myInfo = this.$cc98Authorization.myInfo;
        if (this.myInfo !== null) {
            this.myUserInfo = this.$cc98UserInfo.pickUserInfo(this.myInfo.name);
        }
        else {
            this.myUserInfo = null;
        }
    };
    ;
    ChatController.prototype.closeGroup = function () {
        var _this = this;
        this.$signalR.messageHub.server.destroyGroup(this.groupName).done(function () {
            _this.$window.close();
        }).fail(function () {
        });
    };
    ;
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
    ChatController.prototype.syncUserInfo = function () {
        var _this = this;
        var result = {};
        $.each(this.chatGroupInfo.members, function (index, value) {
            result[value.name] = _this.$cc98UserInfo.pickUserInfo(value.name);
        });
        this.members = result;
        this.$scope.$apply('members');
        this.$scope.$apply('hasMembers');
    };
    ;
    Object.defineProperty(ChatController.prototype, "hasMembers", {
        get: function () {
            return !Utility.isEmpty(this.members);
        },
        enumerable: true,
        configurable: true
    });
    return ChatController;
}());
var CreateGroupController = (function () {
    function CreateGroupController($window, $location, $scope, $signalR, $systemMessage) {
        this.$window = $window;
        this.$location = $location;
        this.$scope = $scope;
        this.$signalR = $signalR;
        this.$systemMessage = $systemMessage;
    }
    CreateGroupController.prototype.create = function () {
        var _this = this;
        if (this.$signalR.isConnected) {
            this.$signalR.messageHub.server.createGroup(this.name, this.title, this.description).done(function () {
                _this.$systemMessage.showMessage('创建讨论组成功。');
                _this.$location.path(Utility.stringFormat('/Group/{0}', encodeURIComponent(_this.name)));
                _this.clear();
            }).fail(function (data) {
                _this.$systemMessage.showMessage(Utility.stringFormat('创建讨论组失败：{0}', data));
            });
        }
        else {
            console.error('SignalR 未连接，不能执行创建操作。');
        }
    };
    CreateGroupController.prototype.clear = function () {
        this.name = null;
        this.title = null;
        this.description = null;
    };
    return CreateGroupController;
}());
var CC98Chat;
(function (CC98Chat) {
    console.debug('正在初始化 CC98 Chat 主模块...');
    var app = angular.module('cc98-chat', ['ngRoute', 'ngAnimate']);
    CC98Chat.isPresentationMode = false;
    function addController(name, ctor) {
        var dependencies = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            dependencies[_i - 2] = arguments[_i];
        }
        var realParams = dependencies;
        realParams.push(ctor);
        return app.controller(name, realParams);
    }
    function addService(name, ctor) {
        var dependencies = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            dependencies[_i - 2] = arguments[_i];
        }
        var realParams = dependencies;
        realParams.push(ctor);
        return app.service(name, realParams);
    }
    function config(configFunction) {
        var dependencies = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            dependencies[_i - 1] = arguments[_i];
        }
        var realParams = dependencies;
        realParams.push(configFunction);
        return app.config(realParams);
    }
    function configRoutes($routeProvider, $locationProvider) {
        console.debug('正在配置应用程序路径 ...');
        $locationProvider.html5Mode({
            enabled: true
        });
        $routeProvider.when('/Home', {
            templateUrl: 'home.html'
        }).when('/Group/:groupName', {
            templateUrl: 'chat.html'
        }).when('/Auth', {
            templateUrl: 'auth.html'
        }).otherwise({
            redirectTo: '/Home'
        });
        console.debug('路径配置完成 ...');
    }
    config(configRoutes, '$routeProvider', '$locationProvider');
    app.constant('$siteUri', $('html').data('site-uri'));
    app.constant('$apiUri', $('html').data('api-uri'));
    app.constant('$logonUri', $('html').data('logon-uri'));
    app.constant('$cc98ClientId', '91b3ac76-0919-4fde-85d0-91ffde409a45');
    addService('$systemMessage', SystemMessageService, '$rootScope');
    addService('$signalR', SignalRService, '$apiUri', '$rootScope', '$cc98Authorization');
    addService('$cc98UserInfo', CC98UserInfoService, '$apiUri', '$rootScope', '$http');
    addService('$cc98Authorization', CC98AuthorizationService, '$siteUri', '$logonUri', '$apiUri', '$cc98ClientId', '$window', '$http', '$rootScope');
    addController('MainController', MainController, '$siteUri', '$rootScope', '$scope', '$timeout');
    addController('HomeController', HomeController, '$scope', '$signalR', '$cc98Authorization');
    addController('AuthController', AuthController, '$rootScope', '$location', '$window', '$cc98Authorization');
    addController('ChatController', ChatController, '$routeParams', '$scope', '$rootScope', '$window', '$cc98Authorization', '$cc98UserInfo', '$signalR', '$systemMessage');
    addController('CreateGroupController', CreateGroupController, '$window', '$location', '$scope', '$signalR', '$systemMessage');
})(CC98Chat || (CC98Chat = {}));
//# sourceMappingURL=app.js.map