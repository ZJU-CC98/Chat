// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 表示强类型的集线器代理对象。
 */
interface ITypedHubProxy<TServer, TClient> extends SignalR.Hub.Proxy {
    /**
     * 提供集线器服务器端功能。
     */
    server: TServer;
    /**
     * 提供集线器客户端功能。
     */
    client: TClient;
}

/**
 * 定义消息服务的服务器端功能。
 */
// ReSharper disable once InconsistentNaming
interface MessageHub {
    sendInstantMessage(receiver: string, content: string): JQueryPromise<void>;
    sendGlobalMessage(content: string): void;
    sendGroupMessage(groupName: string, content: string): JQueryPromise<void>;
    getGroup(groupName): JQueryPromise<ChatGroupInfo>;
    getGroups(): JQueryPromise<ChatGroupInfo[]>;
    createGroup(name: string, title: string, description: string): JQueryPromise<void>;
    destroyGroup(groupName: string): JQueryPromise<void>;
    enterGroup(groupName: string): JQueryPromise<void>;
    exitGroup(groupName: string): JQueryPromise<void>;
}

/**
 * 定义消息服务的客户端功能。
 */
// ReSharper disable once InconsistentNaming
interface MessageHubClient {
    newUserMessage: (message: Message) => void;
    newGroupMessage: (groupName: string, sender: string, content: string) => void;
    userEnterGroup: (groupName: string, userName: string) => void;
    userExitGroup: (groupName: string, userName: string) => void;
    groupDestroyed: (groupName: string) => void;
    groupCreated: (groupInfo: ChatGroupInfo) => void;
}

/**
 * 扩展 SignalR 集线器功能。
 */
interface SignalR {
    messageHub: ITypedHubProxy<MessageHub, MessageHubClient>;
}