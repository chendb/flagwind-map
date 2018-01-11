declare namespace flagwind {
    /**
     * 坐标点
     */
    class MinemapPoint {
        x: number;
        y: number;
        spatial: any;
        constructor(x: number, y: number, spatial: any);
    }
    /**
     * 空间投影
     */
    class MinemapSpatial {
        wkid: number;
        constructor(wkid: number);
    }
}
