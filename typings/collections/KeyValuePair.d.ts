declare namespace flagwind {
    /**
     * 定义可设置或检索的键/值对。
     * @class
     * @version 1.0.0
     */
    class KeyValuePair<K, V> {
        private _key;
        private _value;
        /**
         * 获取键/值对中的键。
         * @property
         * @returns K
         */
        readonly key: K;
        /**
         * 获取键/值对中的值。
         * @property
         * @returns V
         */
        readonly value: V;
        /**
         * 初始化 KeyValuePair<K, V> 类的新实例。
         * @param  {K} key 每个键/值对中定义的对象。
         * @param  {V} value 与 key 相关联的定义。
         */
        constructor(key: K, value: V);
        /**
         * 使用键和值的字符串表示形式返回 KeyValuePair<K, V> 的字符串表示形式。
         * @override
         * @returns string
         */
        toString(): string;
    }
}
