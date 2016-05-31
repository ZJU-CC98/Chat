// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 主页控制器。
 */
class HomeController {

    private $scope: ng.IScope;
    private $signalR: SignalRService;
    private $cc98Authorization: CC98AuthorizationService;

    /**
     * 当前用户是否已经登录。
     */
    private isLoggedOn = false;

    /**
     * 所有用户组的字典。
     */
    private groups: Dictionary<ChatGroupInfo> = {};

    public constructor($scope, $signalR, $cc98Authorization) {

        console.debug('正在进入首页控制器 ...');

        this.$scope = $scope;
        this.$signalR = $signalR;
        this.$cc98Authorization = $cc98Authorization;
        // 附加集线器事件
        this.attachHubEvents();
        this.$scope.$on(Events.logOnEnd, () => this.handleLogOnEvent());
        this.$scope.$on(Events.serverConnectEnd, () => this.handleServerConnectEnd());

        // 尝试自动登录。
        if (!this.$cc98Authorization.tryAutoLogOn()) {
            // 如果无法自动登录则立即链接 SignalR，否则将等到登录结束后才进行链接。
            $signalR.start();
        }
    }

    /**
     * 处理服务器数据更改事件。
     */
    private handleServerConnectEnd() {
        console.debug('检测到服务器连接状态更改');
        this.syncGroups();
    }
    /**
     * 处理用户更改事件。
     */
    private handleLogOnEvent() {
        this.isLoggedOn = this.$cc98Authorization.isLoggedOn;
        this.$signalR.start();
    }

    /**
     * 执行登录操作。
     */
    logOn() {
        this.$cc98Authorization.logOn('/Home');
    }

    private getDisplayTitle(group) {
        if (Utility.hasValue(group.title)) {
            return group.title;
        }
        else {
            return group.name;
        }
    };

    /**
     * 是否具有组。
     * @returns {}
     */
    get hasGroups() {
        return !Utility.isEmpty(this.groups);
    }


    /**
     * 强制刷新用户列表。
     * @returns {}
     */
    private syncGroups() {
        this.$signalR.messageHub.server.getGroups().done(data => {
            console.info('成功获取组信息，数量 = %d', data.length);
            // 新数据
            var newGroups: Dictionary<ChatGroupInfo> = {};
            // 逐个附加
            $.each(data, (index, value) => {
                newGroups[value.name] = value;
            });
            // 刷新原有数据
            this.groups = newGroups;
            this.$scope.$apply('groups');
            this.$scope.$apply('hasGroups');
        }).fail(() => {
            console.warn('获取组信息时发生错误。');
        });
    };

    /**
     * 处理创建新组事件。
     * @param group 新组数据。
     */
    private handleGroupCreated(group) {
        console.debug('检测到创建新组');
        // 添加数据
        this.groups[group.name] = group;
        // 刷新界面
        this.$scope.$apply('groups');
        this.$scope.$apply('hasGroups');
    };
    /**
     * 处理讨论组删除事件。
     * @param groupName 被删除的讨论组名称。
     */
    private handleGroupDestroyed(groupName: string) {
        console.debug('检测到组销毁');
        // 删除数据
        delete this.groups[groupName];
        // 刷新界面
        this.$scope.$apply('groups');
        this.$scope.$apply('hasGroups');
    };

    /**
     * 附加集线器事件。
     */
    private attachHubEvents() {
        this.$signalR.messageHub.client.groupCreated = group => this.handleGroupCreated(group);
        this.$signalR.messageHub.client.groupDestroyed = groupName => this.handleGroupDestroyed(groupName);
    };
}