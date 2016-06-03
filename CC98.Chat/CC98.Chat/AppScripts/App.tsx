// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/// <reference path="Utility.tsx"/>
/// <reference path="Types.tsx"/>
/// <reference path="Events.tsx"/>
/// <reference path="Hubs.tsx"/>
/// <reference path="UserInfo.tsx"/>
/// <reference path="Message.tsx"/>
/// <reference path="ChatGroupInfo.tsx"/>
/// <reference path="CC98AuthorizationService.tsx"/>
/// <reference path="CC98UserInfoService.tsx"/>
/// <reference path="SignalRService.tsx"/>
/// <reference path="SystemMessageService.tsx"/>
/// <reference path="HomeController.tsx"/>
/// <reference path="MainController.tsx"/>
/// <reference path="ChatController.tsx"/>
/// <reference path="ChatGroupController.tsx"/>
module CC98Chat {

    console.debug('正在初始化 CC98 Chat 主模块...');

    /**
     * 应用程序实例对象
     */
    var app = angular.module('cc98-chat', ['ngRoute', 'ngAnimate']);

    /**
     * 是否处于演示模式。
     */
    export var isPresentationMode = false;

    /**
     * 向主模块中添加控制器对象。
     * @param name 控制器的名称。
     * @param ctor 控制器的构造方法。
     * @param dependencies 控制器使用的其它依赖对象。
     */
    function addController(name: string, ctor: ctorFunction, ...dependencies: string[]) {
        var realParams: any[] = dependencies;
        realParams.push(ctor);
        return app.controller(name, realParams);
    }

    /**
     * 向主模块中添加服务对象。
     * @param name 服务的名称。
     * @param ctor 服务的构造方法。
     * @param dependencies 服务使用的其它依赖对象。
     */
    function addService(name: string, ctor: ctorFunction, ...dependencies: string[]) {
        var realParams: any[] = dependencies;
        realParams.push(ctor);
        return app.service(name, realParams);
    }

    /**
     * 在主模块中配置服务。
     * @param configFunction 配置函数。
     * @param dependencies 可选依赖项。
     * @returns {ng.IModule} 模块对象
     */
    function config(configFunction: (...args: any[]) => any, ...dependencies: string[]) {
        var realParams: any[] = dependencies;
        realParams.push(configFunction);
        return app.config(realParams);
    }

    /**
     * 配置应用程序路由。
     * @param $routeProvider 路由提供程序。
     */
    function configRoutes($routeProvider: ng.route.IRouteProvider, $locationProvider: ng.ILocationProvider) {

        console.debug('正在配置应用程序路径 ...');

        // 激活 HTML5 路径模式
        $locationProvider.html5Mode({
            enabled: true
        });

        // 主页
        $routeProvider.when('/Home', {
            templateUrl: 'home.html'
            // 小组页面
        }).when('/Group/:groupName', {
            templateUrl: 'chat.html'
            // 授权页面
        }).when('/Auth', {
            templateUrl: 'auth.html'
            // 其他页面跳回主页
        }).otherwise({
            redirectTo: '/Home'
        });
        console.debug('路径配置完成 ...');
    }

    // 配置应用程序路由
    config(configRoutes, '$routeProvider', '$locationProvider');

    // 基础路径
    app.constant('$siteUri', $('html').data('site-uri'));
    app.constant('$apiUri', $('html').data('api-uri'));
    app.constant('$logonUri', $('html').data('logon-uri'));

    // 注册客户端 ID
    app.constant('$cc98ClientId', '91b3ac76-0919-4fde-85d0-91ffde409a45');
    // 注册消息服务
    addService('$systemMessage', SystemMessageService, '$rootScope');
    // 注册 SignalR 服务
    addService('$signalR', SignalRService, '$apiUri', '$rootScope', '$cc98Authorization');
    // 添加 CC98 用户信息服务
    addService('$cc98UserInfo', CC98UserInfoService, '$apiUri', '$rootScope', '$http');
    // 添加 CC98 用户认证服务
    addService('$cc98Authorization', CC98AuthorizationService, '$siteUri','$logonUri', '$cc98ClientId', '$window', '$http', '$rootScope');

    // 主页控制器
    addController('MainController', MainController, '$rootScope', '$scope', '$timeout');
    // 实际主页控制器
    addController('HomeController', HomeController, '$scope', '$signalR', '$cc98Authorization');
    // 授权控制器
    addController('AuthController', AuthController, '$rootScope', '$location', '$window', '$cc98Authorization');
    // 聊天控制器
    addController('ChatController', ChatController, '$routeParams', '$scope', '$rootScope', '$window', '$cc98Authorization', '$cc98UserInfo', '$signalR', '$systemMessage');
    // 创建小组控制器
    addController('CreateGroupController', CreateGroupController, '$window', '$location', '$scope', '$signalR', '$systemMessage');
}