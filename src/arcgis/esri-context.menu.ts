/// <reference path="../base/flagwind.map.ts" />
namespace flagwind {
    /**
     * 对ArcGIS右键菜单实现
     */
    export class EsriContextMenu implements FlagwindContextMenu {
        public enabled: boolean = false;

        public point: FlagwindPoint;

        public menu: any;

        public constructor(public map: any) {

        }

        public create(eventArgs: ContextMenuCreateEventArgs): void {
            const menus = eventArgs.menus;
            this.menu = new dijit.Menu({
                onOpen: (box: any) => {
                    this.point = this.getMapPointFromMenuPosition(box, this.map);
                }
            });
            for (let i = 0; i < menus.length; i++) {
                this.menu.addChild(new dijit.MenuItem({
                    label: menus[i],
                    onClick: function (evt: any) {
                        eventArgs.onClick(this.label);
                    }
                }));
            }
            this.menu.startup();

        }

        /**
         * 获取菜单单击的坐标信息
         */
        public getMapPointFromMenuPosition(box: any,map: any): FlagwindPoint {
            let x = box.x,
                y = box.y;
            switch (box.corner) {
                case "TR":
                    x += box.w;
                    break;
                case "BL":
                    y += box.h;
                    break;
                case "BR":
                    x += box.w;
                    y += box.h;
                    break;
            }
            const screenPoint = new esri.geometry.Point(x - map.position.x, y - map.position.y);
            return map.toMap(screenPoint);
        }

        public enable(): void {
            if (this.enabled) {
                console.warn("已经开启快捷菜单");
                return;
            }
            this.enabled = true;
            this.menu.bindDomNode(this.map.container);
        }

        public disable(): void {
            this.enabled = false;
            this.menu.unBindDomNode(this.map.container);
        }
    }
}
