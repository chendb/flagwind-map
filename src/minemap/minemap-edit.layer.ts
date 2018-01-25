
namespace flagwind {

    /**
     * 编辑要素图层
     */
    export class MinemapEditLayer implements IFlagwindEditLayer {
        private graphic: MinemapMarker;
        private draggingFlag: boolean = false;
        private cursorOverPointFlag: boolean = false;

        public constructor(public businessLayer: MinemapPointLayer) {

        }

        public get map(): any {
            return this.businessLayer.flagwindMap.map;
        }

        public registerEvent(graphic: MinemapMarker): void {
            const me = this;
            graphic.on("onMouseOver", function (args: EventArgs) {
                console.log("test--->onMouseOver");
                me.cursorOverPointFlag = true;
                me.map.dragPan.disable();
            });
            graphic.on("onMouseOut", function (args: EventArgs) {
                console.log("test--->onMouseOut");
                me.cursorOverPointFlag = false;
                me.map.dragPan.enable();
            });
            graphic.on("onMouseDown", function (args: EventArgs) {
                if (!me.cursorOverPointFlag) return;
                me.draggingFlag = true;
                console.log("test--->onMouseDown");
                (<any>window)._editLayer = me;
                console.log("test--->map.on.mousemove");
                me.map.on("mousemove", me.mouseMovePoint);
            });
            graphic.on("onMouseUp", function (args: EventArgs) {
                console.log("test--->onMouseUp");
                if (!me.draggingFlag) return;
                me.draggingFlag = false;
                console.log("test--->map.off.mousemove");
                me.map.off("mousemove", me.mouseMovePoint);
                (<any>window)._editLayer = null;
                me.updatePoint(me);
            });
        }

        public updatePoint(editLayer: this) {
            let isOK = confirm("确定要更新坐标为x:" + editLayer.graphic.geometry.x + ",y:" + editLayer.graphic.geometry.x);
            if (!isOK) {
                this.cancelEdit(this.graphic.attributes.id);
                return;
            }
            editLayer.onChanged({
                key: editLayer.graphic.attributes.id,
                longitude: editLayer.graphic.geometry.x,
                latitude: editLayer.graphic.geometry.y
            }, isOK);

        }

        public mouseMovePoint(e: any) {
            let editLayer = (<any>window)._editLayer;
            console.log("test-->status  over:" + editLayer.cursorOverPointFlag + ".drag:" + editLayer.draggingFlag);
            if (!editLayer.draggingFlag) return;
            console.log("test-->update  x:" + e.lngLat.lng + ".y:" + e.lngLat.lat);
            let point = new MinemapPoint(e.lngLat.lng, e.lngLat.lat);
            (<any>editLayer.graphic).geometry = point;
        }

        public activateEdit(key: string): void {
            let g: MinemapMarker = this.businessLayer.getGraphicById(key);
            if (g) {
                this.graphic = g.clone(g.id + "_copy");
            }
            this.businessLayer.hide();
            this.graphic.addTo(this.map);
            this.registerEvent(this.graphic);
        }

        public cancelEdit(key: string): void {
            let graphic: MinemapMarker = this.graphic;
            graphic.remove();
            this.map.off("mousemove", this.mouseMovePoint);
            this.businessLayer.show();
            this.cursorOverPointFlag = false;
            this.draggingFlag = false;
        }
        public onChanged(options: any, isSave: boolean): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                resolve(true);
            });
        }
    }
}
