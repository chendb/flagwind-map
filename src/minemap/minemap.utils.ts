namespace flagwind {
    export class MinemapUtils {

        /**
         * 求两点之间的距离
         * @param from 起点
         * @param to 终点
         */
        public static getLength(from: MinemapPoint, to: MinemapPoint): number {
            const units = "kilometers";
            let distance = turf.distance(from.toJson(), to.toJson(), units);
            return distance;
        }

        /**
         * 求多点之间连线的距离
         * @param points 多点集
         * @param count 抽点次数
         */
        public static distance(points: Array<MinemapPoint>, count: number | null = 100) {
            if (count == null) {
                count = points.length;
            }
            let interval = 1;
            if (points.length > count) {
                interval = Math.max(Math.floor(points.length / count), 1);
            }
            let length = 0, i = 0;
            for (i = 0; i <= points.length - interval; i = i + interval) {
                let start = points[i];
                let end = points[i + interval];
                if(start && end) {
                    length += MinemapUtils.getLength(start, end);
                }
            }
            if (i < points.length - 1) {
                length += MinemapUtils.getLength(points[i], points[points.length - 1]);
            }

            return length;
        }

    }
}
