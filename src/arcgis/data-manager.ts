namespace flagwind {
    export class DataManager {
        
        public rawData: Array<any> = [];

        /**
         * 客户端聚合
         * @param clusterRatio 聚合比率
         * @param maxSingleFlareCount 最大的单个聚合点包含成员数
         * @param areaDisplayMode 是否显示聚合区域
         * @param map 地图对象
         */
        public clientSideClustering(
            clusterRatio: number,           // 聚合比率
            maxSingleFlareCount: number,    // 最大的单个聚合点包含成员数
            areaDisplayMode: boolean,
            map: any
        ) {
            // let itcount = 0;
            console.time("fake-server-side-cluster");

            let webExtent = map.extent;

            // set up a grid system to do the clustering

            // get the total amount of grid spaces based on the height and width of the map (divide it by clusterRatio) - then get the degrees for x and y
            let xCount = Math.round(map.width / clusterRatio);
            let yCount = Math.round(map.height / clusterRatio);

            let xw = (webExtent.xmax - webExtent.xmin) / xCount;
            let yh = (webExtent.ymax - webExtent.ymin) / yCount;

            let gsxmin, gsxmax, gsymin, gsymax;
            let dataLength = this.rawData.length;

            // create an array of clusters that is a grid over the visible extent. Each cluster contains the extent (in web merc) that bounds the grid space for it.
            let clusters: Array<any> = [];
            for (let i = 0; i < xCount; i++) {
                gsxmin = webExtent.xmin + xw * i;
                gsxmax = gsxmin + xw;
                for (let j = 0; j < yCount; j++) {
                    gsymin = webExtent.ymin + yh * j;
                    gsymax = gsymin + yh;
                    let ext = new esri.geometry.Extent({
                        xmin: gsxmin,
                        xmax: gsxmax,
                        ymin: gsymin,
                        ymax: gsymax
                    });
                    ext.setSpatialReference(
                        new esri.SpatialReference({
                            wkid: 4326
                        })
                    );
                    clusters.push({
                        extent: ext,
                        clusterCount: 0,
                        subTypeCounts: <Array<any>>[],
                        singles: <Array<any>>[],
                        points: <Array<any>>[]
                    });
                }
            }

            let web, obj;
            for (let i = 0; i < dataLength; i++) {
                obj = this.rawData[i];

                web = esri.geometry.lngLatToXY(obj.x, obj.y);
                if (
                    web[0] < webExtent.xmin ||
                    web[0] > webExtent.xmax ||
                    web[1] < webExtent.ymin ||
                    web[1] > webExtent.ymax
                ) {
                    continue;
                }

                // let foundCluster = false;
                // loop cluster grid to see if it should be added to one
                for (let j = 0, jLen = clusters.length; j < jLen; j++) {
                    let cl = clusters[j];

                    if (
                        web[0] < cl.extent.xmin ||
                        web[0] > cl.extent.xmax ||
                        web[1] < cl.extent.ymin ||
                        web[1] > cl.extent.ymax
                    ) {
                        continue; // not here so carry on
                    }

                    // recalc the x and y of the cluster by averaging the points again
                    cl.x =
                        cl.clusterCount > 0
                            ? (obj.x + cl.x * cl.clusterCount) /
                              (cl.clusterCount + 1)
                            : obj.x;
                    cl.y =
                        cl.clusterCount > 0
                            ? (obj.y + cl.y * cl.clusterCount) /
                              (cl.clusterCount + 1)
                            : obj.y;

                    if (areaDisplayMode) {
                        cl.points.push([obj.x, obj.y]);
                    }

                    cl.clusterCount++;

                    let subTypeExists = false;
                    for (
                        let s = 0, sLen = cl.subTypeCounts.length;
                        s < sLen;
                        s++
                    ) {
                        if (cl.subTypeCounts[s].name === obj.facilityType) {
                            cl.subTypeCounts[s].count++;
                            subTypeExists = true;
                            break;
                        }
                    }
                    if (!subTypeExists) {
                        cl.subTypeCounts.push({
                            name: obj.facilityType,
                            count: 1
                        });
                    }

                    cl.singles.push(obj);
                }
            }

            let results = [];
            for (let i = 0, len = clusters.length; i < len; i++) {
                if (clusters[i].clusterCount === 1) {
                    results.push(clusters[i].singles[0]);
                } else if (clusters[i].clusterCount > 0) {
                    if (clusters[i].singles.length > maxSingleFlareCount) {
                        clusters[i].singles = [];
                    }
                    results.push(clusters[i]);
                }
            }

            console.timeEnd("fake-server-side-cluster");
            return results;
        }

        public getData() {
            return this.rawData;
        }

        public setData(data: any) {
            this.rawData = data;
        }
    }
}
