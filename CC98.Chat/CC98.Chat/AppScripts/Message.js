// A '.tsx' file enables JSX support in the TypeScript compiler, 
// for more information see the following page on the TypeScript wiki:
// https://github.com/Microsoft/TypeScript/wiki/JSX
/*
 * 表示一条消息。
 */
var Message = (function () {
    function Message() {
    }
    return Message;
}());
/**
 * 表示消息的类型。
 */
var MessageType;
(function (MessageType) {
    MessageType[MessageType["Others"] = 0] = "Others";
    MessageType[MessageType["Me"] = 1] = "Me";
    MessageType[MessageType["System"] = 2] = "System";
})(MessageType || (MessageType = {}));
//# sourceMappingURL=Message.js.map