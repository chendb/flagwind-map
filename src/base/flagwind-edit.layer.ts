
namespace flagwind {
    export const EDIT_LAYER_OPTIONS: any = {
        confirm: (context: { title: string; content: any; onOk: () => void; onCancel: () => void }) => {
            if (window.confirm(context.content)) {
                context.onOk();
            } else {
                context.onCancel();
            }
        },
        onEditInfo: function (model: { id: string; latitude: number; longitude: number }, isSave: boolean): Promise<boolean> {
            return new Promise<boolean>((resolve, reject) => {
                resolve(true);
            });
            // console.log("onEditInfo");
        }
    };

    export interface IFlagwindEditLayer extends IFlagwindSingleLayer {

        businessLayer: FlagwindBusinessLayer;
        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;

        onChanged(item: any, isSave: boolean): Promise<boolean>;
    }

}
