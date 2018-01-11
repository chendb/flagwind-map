declare namespace flagwind {
    /**
     * 表示在应用程序执行期间发生的错误。
     * @class
     * @version 1.0.0
     */
    class Exception extends Error {
        constructor(message?: string);
    }
}
