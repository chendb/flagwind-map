declare namespace flagwind {
    class MapUtils {
        static PI: number;
        static X_PI: number;
        /**
         * 判断原始点坐标与目标点坐标是否一样
         *
         * @static
         * @param {*} originGeometry 原始点
         * @param {*} targetGeometry 要比较的目标点
         * @returns {boolean} true:一样,false:不一样
         * @memberof MapUtils
         */
        static isEqualPoint(originGeometry: any, targetGeometry: any): boolean;
        /**
         * 获取角度的方法
         */
        static getAngle(pt1: {
            x: number;
            y: number;
        }, pt2: {
            x: number;
            y: number;
        }): number;
        static validDevice(item: any): any;
        static delta(lat: any, lon: any): {
            "lat": number;
            "lon": number;
        };
        static point25To2(x: number, y: number): {
            "lat": number;
            "lon": number;
        };
        static point2To25(x: number, y: number): {
            "lat": number;
            "lon": number;
        };
        static mercatorUnproject(lng: number, lat: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * WGS-84 to GCJ-02
         */
        static gcj_encrypt(wgsLat: number, wgsLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to WGS-84
         */
        static gcj_decrypt(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to WGS-84 exactly
         */
        static gcj_decrypt_exact(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * GCJ-02 to BD-09
         */
        static bd_encrypt(gcjLat: number, gcjLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * BD-09 to GCJ-02
         */
        static bd_decrypt(bdLat: number, bdLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         *  WGS-84 to Web mercator
         * mercatorLat -> y mercatorLon -> x
         */
        static mercator_encrypt(wgsLat: number, wgsLon: number): {
            "lat": number;
            "lon": number;
        };
        static lonlat2mercator(lat: number, lon: number): {
            "lon": number;
            "lat": number;
        };
        static mercator2lonlat(mercatorLat: number, mercatorLon: number): {
            "lon": number;
            "lat": number;
        };
        /**
         * Web mercator to WGS-84
         * mercatorLat -> y mercatorLon -> x
         */
        static mercator_decrypt(mercatorLat: number, mercatorLon: number): {
            "lat": number;
            "lon": number;
        };
        /**
         * 求解两点距离
         */
        static distance(latA: number, lonA: number, latB: number, lonB: number): number;
        static outOfChina(lat: number, lon: number): boolean;
        static transformLat(x: number, y: number): number;
        static transformLon(x: number, y: number): number;
    }
}
