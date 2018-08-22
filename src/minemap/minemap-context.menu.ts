/// <reference path="../base/flagwind.map.ts" />
namespace flagwind {
    /**
     * 对Minemap地图封装
     */
    export class MinemapContextMenu implements FlagwindContextMenu {
        public enabled: boolean = false;

        public point: FlagwindPoint;

        public menu: any;

        public constructor(public map: any) {}

        public create(eventArgs: ContextMenuCreateEventArgs): void {
            throw new Error("未实现");
        }

        public enable(): void {
            throw new Error("未实现");
        }

        public disable(): void {
            throw new Error("未实现");
        }
    }
}
