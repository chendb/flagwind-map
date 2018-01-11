namespace flagwind {
    /**
     * 坐标点
     */
    export class MinemapPoint {

        public constructor(
            public x: number,
            public y: number,
            public spatial: any
        ) { }

    }

    /**
     * 空间投影
     */
    export class MinemapSpatial {
        public constructor(
            public wkid: number
        ) {

        }
    }
}
