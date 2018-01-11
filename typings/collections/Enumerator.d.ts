declare namespace flagwind {
    /**
     * 表示一个默认的枚举器。
     * @class
     * @version 1.0.0
     */
    class Enumerator<T> implements IEnumerator<T> {
        private _items;
        private _current;
        private _index;
        /**
         * 获取当前遍历的值。
         * @summary 如果已经遍历结束，则返回 undefined。
         * @property
         * @returns T
         */
        readonly current: T;
        /**
         * 初始化 Enumerator<T> 类的新实例。
         * @constructor
         * @param  {Array<T>} items 要枚举的元素。
         */
        constructor(items: Array<T>);
        /**
         * 将枚举数推进到集合的下一个元素。
         * @returns boolean 如果枚举数已成功地推进到下一个元素，则为 true；如果枚举数传递到集合的末尾，则为 false。
         */
        next(): boolean;
    }
}
