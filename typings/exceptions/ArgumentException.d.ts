declare namespace flagwind {
    /**
     * 当向方法提供的参数之一无效时引发的异常。
     * @class
     * @version 1.0.0
     */
    class ArgumentException extends Exception {
        constructor(message?: string);
    }
}
