declare namespace flagwind {
    /**
     * 当方法调用对于对象的当前状态无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    class InvalidOperationException extends Exception {
        constructor(message?: string);
    }
}
