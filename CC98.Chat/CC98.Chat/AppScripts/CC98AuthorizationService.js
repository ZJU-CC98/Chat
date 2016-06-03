// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 提供 CC98 授权验证服务。
 */
var CC98AuthorizationService = (function () {
    function CC98AuthorizationService($siteUri, $logonUri, $cc98ClientId, $window, $http, $rootScope) {
        /**
         * 访问令牌的数据键。
         */
        this.accessTokenKey = 'access_token';
        /**
         * 访问令牌类型的数据键。
         */
        this.tokenTypeKey = 'type';
        /**
         * 是否登录的内部字段。
         */
        this.isLoggedOnInternal = false;
        /**
         * 当前用户的信息的内部字段。
         */
        this.myInfoInternal = null;
        console.debug('正在构建 CC98 身份认证服务...');
        this.$siteUri = $siteUri;
        this.$logonUri = $logonUri;
        this.$cc98ClientId = $cc98ClientId;
        this.$window = $window;
        this.$http = $http;
        this.$rootScope = $rootScope;
    }
    /**
     * 构建 OAuth 重定向字符串。
     * @param returnUrl OAuth 使用的客户端 ID。
     * @param redirectUri OAuth 使用的重定向地址。
     * @returns {string} 用于重定向的 OAuth 授权服务器地址。
     */
    CC98AuthorizationService.prototype.buildOAuthRedirectUri = function (clientId, returnUrl) {
        // 重定向地址
        // TODO: 修改为实际地址
        var redirectUri = Utility.combineUri(this.$siteUri, '/Auth');
        // 将实际地址保存入 state
        var state = returnUrl;
        var authPath = Utility.stringFormat('/OAuth/Authorize?response_type=token&scope=getmessage* setmessage*&client_id={0}&redirect_uri={1}&state={2}', encodeURIComponent(clientId), encodeURIComponent(redirectUri), encodeURIComponent(state));
        return Utility.combineUri(this.$logonUri, authPath);
    };
    Object.defineProperty(CC98AuthorizationService.prototype, "accessToken", {
        /**
         * 获取当前的访问令牌。
         * @returns {string} 当前的访问令牌。
         */
        get: function () {
            return this.accessTokenInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "tokenType", {
        /**
         * 获取当前的令牌类型。
         * @returns {string} 当前的令牌类型。
         */
        get: function () {
            return this.tokenTypeInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "isLoggedOn", {
        /**
         * 获取一个值，指示当前用户是否登录。
         * @returns {boolean} 如果当前用户已经登录，返回 true；否则返回 false。
         */
        get: function () {
            return this.isLoggedOnInternal;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CC98AuthorizationService.prototype, "myInfo", {
        /**
         * 获取当前用户的登录信息。
         * @returns {MyInfo} 当前用户的登录信息。
         */
        get: function () {
            return this.myInfoInternal;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * 检测访问令牌操作。
     * @returns {}
     */
    CC98AuthorizationService.prototype.handleAccessToken = function () {
    };
    /**
     * 将凭据存入存储区。
     * @returns {}
     */
    CC98AuthorizationService.prototype.saveTokenToStorage = function () {
        this.$window.localStorage[this.accessTokenKey] = this.accessTokenInternal;
        this.$window.localStorage[this.tokenTypeKey] = this.tokenTypeInternal;
    };
    /**
     * 从存储区加载访问令牌。
     * @returns {boolean} 如果加载成功，返回 true；否则返回 false。
     */
    CC98AuthorizationService.prototype.loadTokenFromStorage = function () {
        this.accessTokenInternal = this.$window.localStorage[this.accessTokenKey];
        this.tokenTypeInternal = this.$window.localStorage[this.tokenTypeKey];
        return this.accessTokenInternal !== null && this.tokenTypeInternal !== null;
    };
    /**
     * 使用当前系统中保存的 Token 加载用户个人信息。
     * @returns {}
     */
    CC98AuthorizationService.prototype.loadMyInfoUsingToken = function () {
        var me = this;
        console.debug('try loading user info from token...');
        // 配置标头
        var requsetConfig = {
            headers: {
                'Authorization': Utility.stringFormat('{0} {1}', this.tokenTypeInternal, this.accessTokenInternal)
            }
        };
        // 发送 get 请求
        this.$http.get('https://api.cc98.org/Me/Basic', requsetConfig).success(function (data, status, headers, config) {
            me.isLoggedOnInternal = true;
            me.myInfoInternal = data;
            // 将凭据写入存储区
            me.saveTokenToStorage();
            me.$rootScope.$broadcast(Events.logOnEnd, true);
            console.info('succeessfully loaded user info.');
        }).error(function () {
            me.$rootScope.$broadcast(Events.logOnEnd, false);
            console.warn('error loading user info.');
        });
    };
    /**
     * 尝试设置访问令牌信息。
     * @param accessToken 访问令牌。
     * @param tokenType 令牌类型。
     * @returns {}
     */
    CC98AuthorizationService.prototype.trySetTokenInfo = function (accessToken, tokenType) {
        console.debug('正在设置用户令牌 ...');
        this.accessTokenInternal = accessToken;
        this.tokenTypeInternal = tokenType;
        this.loadMyInfoUsingToken();
    };
    /**
     * 处理身份验证回调操作。
     * @returns {}
     */
    CC98AuthorizationService.prototype.handleCallback = function () {
        var params = {};
        // 关键数据
        var accessToken = params[this.accessTokenKey];
        var tokenType = params[this.tokenTypeKey];
        // 本地存储区
        this.$window.localStorage[this.accessTokenKey] = accessToken;
        this.$window.localStorage[this.tokenTypeKey] = tokenType;
    };
    /**
     * 如果可能则执行自动登录。
     * @returns {boolean} 是否可以自动登录。
     */
    CC98AuthorizationService.prototype.tryAutoLogOn = function () {
        console.debug('正在尝试自动登录 ...');
        // 如果加载令牌失败则自动返回
        if (!this.loadTokenFromStorage()) {
            console.debug('找不到登录令牌信息');
            return false;
        }
        // 通过令牌加载数据
        this.loadMyInfoUsingToken();
        return true;
    };
    /**
     * 执行显式登录操作。
     * @param returnUrl 登录后要返回的地址。
     */
    CC98AuthorizationService.prototype.logOn = function (returnUrl) {
        // 执行重定向操作
        this.$window.location.href = this.buildOAuthRedirectUri(this.$cc98ClientId, returnUrl);
    };
    /**
     *  执行注销操作。
     */
    CC98AuthorizationService.prototype.logOff = function () {
        this.isLoggedOnInternal = false;
        this.myInfoInternal = null;
    };
    ;
    return CC98AuthorizationService;
}());
//# sourceMappingURL=CC98AuthorizationService.js.map