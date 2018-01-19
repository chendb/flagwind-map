namespace flagwind {
    export class MapUtils {

        public static PI = 3.14159265358979324;
        public static X_PI = 3.14159265358979324 * 3000.0 / 180.0;

        /**
         * 增密
         * @param start 始点
         * @param end 终点
         * @param n 增加的点数
         */
        public static density(start: MinemapPoint, end: MinemapPoint, n: number) {
            const resList = [];
            if (n === 0) {
                resList.push(start);
                resList.push(end);
                return resList;
            }
            const xDiff = (end.x - start.x) / n;
            const yDiff = (end.y - start.y) / n;
            for (let j = 0; j < n; j++) {
                resList.push(new MinemapPoint(start.x + j * xDiff, start.y + j * yDiff));
            }
            resList.push({ x: end.x, y: end.y });
            return resList;
        }
        /**
         * 线段抽稀操作
         * @param paths  多线段
         * @param length 长度
         * @param numsOfKilometer 公里点数
         */
        public static vacuate(paths: Array<Array<any>>, length: number, numsOfKilometer: number) {

            if (numsOfKilometer === 0) {
                let startPath = paths[0];
                let endPath = paths[paths.length - 1];
                return [startPath[0], endPath[endPath.length - 1]];
            }

            let points: Array<any> = [];

            for (let i = 0; i < paths.length; i++) {
                points = points.concat(paths[i]);
            }

            const total = length * (numsOfKilometer);

            if (points.length > total) {
                let s = 0;
                let interval = Math.max(Math.floor(points.length / total), 1);
                let sLine = [];
                while (s < total) {
                    sLine.push(points[s]);
                    s += interval;
                }

                if (s !== points.length - 1) {
                    sLine.push(points[points.length - 1]);
                }
                return sLine;
            }

            return points;
        }

        /**
         * 判断原始点坐标与目标点坐标是否一样
         *
         * @static
         * @param {*} originGeometry 原始点
         * @param {*} targetGeometry 要比较的目标点
         * @returns {boolean} true:一样,false:不一样
         * @memberof MapUtils
         */
        public static isEqualPoint(originGeometry: any, targetGeometry: any) {
            if ((originGeometry != null) || (targetGeometry != null)) {
                return false;
            }
            return originGeometry.x === targetGeometry.x && originGeometry.y === targetGeometry.y;
        }

        /**
         * 获取角度的方法
         */
        public static getAngle(pt1: { x: number; y: number }, pt2: { x: number; y: number }) {
            let x1 = pt1.x, y1 = pt1.y;
            let x2 = pt2.x, y2 = pt2.y;
            let x = x2 - x1, y = y2 - y1;
            // 第一象限
            if (x > 0 && y >= 0) {
                return Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            // 第四象限
            else if (x > 0 && y < 0) {
                return 360 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            // 第二象限
            else if (x < 0 && y >= 0) {
                return 180 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            // 第三象限
            else if (x < 0 && y < 0) {
                return 180 + Math.round((Math.atan(y / x) / Math.PI * 180));
            }
            else if (x === 0) {
                return 90;
            }
            return 0;
        }

        public static validGeometryModel(item: any) {
            return item.longitude && item.latitude;
        }

        public static delta(lat: any, lon: any) {
            let a = 6378245.0; //  a: 卫星椭球坐标投影到平面地图坐标系的投影因子。  
            let ee = 0.00669342162296594323; //  ee: 椭球的偏心率。  
            let dLat = MapUtils.transformLat(lon - 105.0, lat - 35.0);
            let dLon = MapUtils.transformLon(lon - 105.0, lat - 35.0);
            let radLat = lat / 180.0 * MapUtils.PI;
            let magic = Math.sin(radLat);
            magic = 1 - ee * magic * magic;
            let sqrtMagic = Math.sqrt(magic);
            dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * MapUtils.PI);
            dLon = (dLon * 180.0) / (a / sqrtMagic * Math.cos(radLat) * MapUtils.PI);
            return { "lat": dLat, "lon": dLon };
        }

        public static point25To2(x: number, y: number) {
            const A = 629486.1;
            const B = 850786;
            const C = 106392700;
            const D = 321586.1;
            const E = 380061.7;
            const F = 23949170;
            let xx = 0;
            let yy = 0;
            // 鞍山项目用加法反解出来,暂时写死
            // if("anshan".equals(projectName)){
            // 	xx = (E * x - B * y + F * B - E * C) / (A * E - B * D);
            // 	yy = (D * x - A * y + A * F - C * D) / (B * D - A * E);
            // }else{
            // 其他
            xx = (E * x - B * y + F * B + E * C) / (A * E + B * D);
            yy = (0 - D * x - A * y + A * F - C * D) / (0 - B * D - A * E);
            // }
            return { "lat": yy, "lon": xx };
        }

        // x 为lng ,y 为lat
        public static point2To25(x: number, y: number) {
            const A = 629486.1;
            const B = 850786;
            const C = 106392700;
            const D = 321586.1;
            const E = 380061.7;
            const F = 23949170;

            let xx = 0;
            let yy = 0;
            // 鞍山项目用加法,暂时写死
            // if("anshan".equals(projectName)){
            // 	xx = A * x + B * y + C;
            // 	yy = E * y + D * x + F;
            // }else{
            xx = A * x + B * y - C;
            yy = E * y - D * x + F;
            // }

            // return MapUtils.mercatorUnproject(xx, yy);
            return { "lat": yy, "lon": xx };
        }

        public static mercatorUnproject(lng: number, lat: number) {
            let d = 180 / Math.PI;
            let R_MINOR = 6356752.314245179;
            let r = 6378137;
            let tmp = R_MINOR / r;
            let e = Math.sqrt(1 - tmp * tmp);

            let ts = Math.exp(-lat / r);
            let phi = Math.PI / 2 - 2 * Math.atan(ts);
            let dphi = 0.1;
            let con = 0;
            for (let j = 0; j < 15 && Math.abs(dphi) > 1e-7; j++) {
                con = e * Math.sin(phi);
                con = Math.pow((1 - con) / (1 + con), e / 2);
                dphi = Math.PI / 2 - 2 * Math.atan(ts * con) - phi;
                phi += dphi;
            }
            let rstlng = lng * d / r;
            let rstlat = phi * d;

            return { "lat": rstlat, "lon": rstlng };
        }

        /**
         * WGS-84 to GCJ-02  
         */
        public static gcj_encrypt(wgsLat: number, wgsLon: number) {
            if (MapUtils.outOfChina(wgsLat, wgsLon)) {
                return { "lat": wgsLat, "lon": wgsLon };
            }

            let d = MapUtils.delta(wgsLat, wgsLon);
            return { "lat": wgsLat + d.lat, "lon": wgsLon + d.lon };
        }
        /**
         * GCJ-02 to WGS-84  
         */
        public static gcj_decrypt(gcjLat: number, gcjLon: number) {
            if (MapUtils.outOfChina(gcjLat, gcjLon)) {
                return { "lat": gcjLat, "lon": gcjLon };
            }

            let d = MapUtils.delta(gcjLat, gcjLon);
            return { "lat": gcjLat - d.lat, "lon": gcjLon - d.lon };
        }
        /**
         * GCJ-02 to WGS-84 exactly  
         */
        public static gcj_decrypt_exact(gcjLat: number, gcjLon: number) {
            let initDelta = 0.01;
            let threshold = 0.000000001;
            let dLat = initDelta, dLon = initDelta;
            let mLat = gcjLat - dLat, mLon = gcjLon - dLon;
            let pLat = gcjLat + dLat, pLon = gcjLon + dLon;
            let wgsLat, wgsLon, i = 0;
            while (1) {
                wgsLat = (mLat + pLat) / 2;
                wgsLon = (mLon + pLon) / 2;
                let tmp = MapUtils.gcj_encrypt(wgsLat, wgsLon);
                dLat = tmp.lat - gcjLat;
                dLon = tmp.lon - gcjLon;
                if ((Math.abs(dLat) < threshold) && (Math.abs(dLon) < threshold)) {
                    break;
                }

                if (dLat > 0) pLat = wgsLat; else mLat = wgsLat;
                if (dLon > 0) pLon = wgsLon; else mLon = wgsLon;

                if (++i > 10000) break;
            }
            // console.log(i);  
            return { "lat": wgsLat, "lon": wgsLon };
        }
        /**
         * GCJ-02 to BD-09 
         */
        public static bd_encrypt(gcjLat: number, gcjLon: number) {
            let x = gcjLon, y = gcjLat;
            let z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * MapUtils.X_PI);
            let theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * MapUtils.X_PI);
            let bdLon = z * Math.cos(theta) + 0.0065;
            let bdLat = z * Math.sin(theta) + 0.006;
            return { "lat": bdLat, "lon": bdLon };
        }
        /**
         * BD-09 to GCJ-02  
         */
        public static bd_decrypt(bdLat: number, bdLon: number) {
            let x = bdLon - 0.0065, y = bdLat - 0.006;
            let z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * MapUtils.X_PI);
            let theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * MapUtils.X_PI);
            let gcjLon = z * Math.cos(theta);
            let gcjLat = z * Math.sin(theta);
            return { "lat": gcjLat, "lon": gcjLon };
        }
        /**
         *  WGS-84 to Web mercator  
         * mercatorLat -> y mercatorLon -> x  
         */
        public static mercator_encrypt(wgsLat: number, wgsLon: number) {
            let x = wgsLon * 20037508.34 / 180.;
            let y = Math.log(Math.tan((90. + wgsLat) * MapUtils.PI / 360.)) / (MapUtils.PI / 180.);
            y = y * 20037508.34 / 180.;
            return { "lat": y, "lon": x };
        }

        public static lonlat2mercator(lat: number, lon: number) {
            let mercator = { "lon": 0, "lat": 0 };
            let x = lon * 20037508.34 / 180;
            let y = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
            y = y * 20037508.34 / 180;
            mercator.lon = x;
            mercator.lat = y;
            return mercator;
        }

        public static mercator2lonlat(mercatorLat: number, mercatorLon: number) {
            let lonlat = { "lon": 0, "lat": 0 };
            let x = mercatorLon / 20037508.34 * 180.;
            let y = mercatorLat / 20037508.34 * 180.;
            y = 180 / Math.PI * (2 * Math.atan(Math.exp(y * Math.PI / 180.)) - Math.PI / 2);
            lonlat.lon = x;
            lonlat.lat = y;
            return lonlat;
        }

        /**
         * Web mercator to WGS-84    
         * mercatorLat -> y mercatorLon -> x  
         */
        public static mercator_decrypt(mercatorLat: number, mercatorLon: number) {
            let x = mercatorLon / 20037508.34 * 180.;
            let y = mercatorLat / 20037508.34 * 180.;
            y = 180 / MapUtils.PI * (2 * Math.atan(Math.exp(y * MapUtils.PI / 180.)) - MapUtils.PI / 2);
            return { "lat": y, "lon": x };
        }
        /**
         * 求解两点距离
         */
        public static distance(latA: number, lonA: number, latB: number, lonB: number) {
            let earthR = 6371000.;
            let x = Math.cos(latA * MapUtils.PI / 180.) * Math.cos(latB * MapUtils.PI / 180.) * Math.cos((lonA - lonB) * MapUtils.PI / 180);
            let y = Math.sin(latA * MapUtils.PI / 180.) * Math.sin(latB * MapUtils.PI / 180.);
            let s = x + y;
            if (s > 1) s = 1;
            if (s < -1) s = -1;
            let alpha = Math.acos(s);
            let distance = alpha * earthR;
            return distance;
        }
        public static outOfChina(lat: number, lon: number) {
            if (lon < 72.004 || lon > 137.8347) {
                return true;
            }
            if (lat < 0.8293 || lat > 55.8271) {
                return true;
            }
            return false;
        }
        public static transformLat(x: number, y: number) {
            let ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * MapUtils.PI) + 20.0 * Math.sin(2.0 * x * MapUtils.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(y * MapUtils.PI) + 40.0 * Math.sin(y / 3.0 * MapUtils.PI)) * 2.0 / 3.0;
            ret += (160.0 * Math.sin(y / 12.0 * MapUtils.PI) + 320 * Math.sin(y * MapUtils.PI / 30.0)) * 2.0 / 3.0;
            return ret;
        }
        public static transformLon(x: number, y: number) {
            let ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
            ret += (20.0 * Math.sin(6.0 * x * MapUtils.PI) + 20.0 * Math.sin(2.0 * x * MapUtils.PI)) * 2.0 / 3.0;
            ret += (20.0 * Math.sin(x * MapUtils.PI) + 40.0 * Math.sin(x / 3.0 * MapUtils.PI)) * 2.0 / 3.0;
            ret += (150.0 * Math.sin(x / 12.0 * MapUtils.PI) + 300.0 * Math.sin(x / 30.0 * MapUtils.PI)) * 2.0 / 3.0;
            return ret;
        }
    }
}
