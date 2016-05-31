// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX

/*
 * 表示一条消息。
 */
class Message {

    /**
     * 发言的时间。
     */
    time: Date;
    /**
     * 发言的用户。
     */
    user: UserInfo;
    /**
     * 发言的内容。
     */
    content: string;
    /**
     * 发言的类型。
     */
    messageType: MessageType;

}

/**
 * 表示消息的类型。
 */
enum MessageType {
    Others = 0,
    Me = 1,
    System = 2
}