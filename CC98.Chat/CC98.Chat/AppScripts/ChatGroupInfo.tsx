// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/**
 * 表示一个讨论组的信息。
 */
class ChatGroupInfo {

    /**
     * 讨论组的名称。
     */
    name: string;
    /**
     * 讨论组的标题。
     */
    title: string;
    /**
     * 讨论组管理者名称。
     */
    managerName: string;
    /**
     * 讨论组的成员的集合。
     */
    members: UserInfo[] = new Array();

}