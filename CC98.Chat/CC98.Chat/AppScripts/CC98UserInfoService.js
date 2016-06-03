// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/**
 * 表示 CC98 用户信息访问模块。
 */
var CC98UserInfoService = (function () {
    /**
     * 构造一个对象的新实例。
     * @param $rootScope
     * @param $http
     */
    function CC98UserInfoService($apiUri, $rootScope, $http) {
        /**
         * 用户信息字典。
         */
        this.userDic = {};
        this.$apiUri = $apiUri;
        this.$rootScope = $rootScope;
        this.$http = $http;
    }
    /**
     * 服务器刷新用户数据。
     * @param userName 用户名。
    */
    CC98UserInfoService.prototype.getUserInfoFromServer = function (userName) {
        var me = this;
        console.debug('正在尝试获取用户信息，用户名 = %s', userName);
        // 请求 URL
        var url = Utility.combineUri(this.$apiUri, Utility.stringFormat('/user/name/{0}', encodeURIComponent(userName)));
        // 执行 HTTP 请求
        this.$http.get(url).success(function (data) {
            console.debug('成功获取用户信息，用户名 = %s', userName);
            // 数据库检索
            var item = me.userDic[userName];
            // 复制对象
            item.name = data.name;
            item.id = data.id;
            item.portraitUrl = data.portraitUrl;
            me.$rootScope.$broadcast(Events.userInfoUpdated, item);
        }).error(function () {
            console.warn('获取用户信息失败，用户名 = %s', userName);
            // 失败则不进行任何操作。
        });
    };
    /**
     * 从系统中检索用户信息。如果信息不存在，则从服务器端进行检索。
     */
    CC98UserInfoService.prototype.pickUserInfo = function (userName) {
        console.debug('正在检索用户信息，用户名 = %s', userName);
        // 检索字典。
        var item = this.userDic[userName];
        // 如果项目存在，则直接返回
        if (item) {
            return item;
        }
        // 否则创建临时对象。
        item = new UserInfo();
        item.id = 0;
        item.name = userName;
        item.portraitUrl = null;
        // 加入字典
        this.userDic[userName] = item;
        // 请求从服务器加载用户信息。
        this.getUserInfoFromServer(userName);
        // 返回临时对象。
        return item;
    };
    return CC98UserInfoService;
}());
//# sourceMappingURL=CC98UserInfoService.js.map