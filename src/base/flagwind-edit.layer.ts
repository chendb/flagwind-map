
namespace flagwind {
    export const EDIT_LAYER_OPTIONS: any = {

        onEditInfo: function (key: string, lon: number, lat: number, isSave: boolean) {
            console.log("onEditInfo");
        }
    };

    export interface IFlagwindEditLayer {

        /**
         * 激活编辑事件
         * @param key 要编辑要素的id
         */
        activateEdit(key: string): void;
        /**
         * 取消编辑要素
         */
        cancelEdit(key: string): void;

        onChanged(options: any, isSave: boolean): Promise<boolean>;
    }

}
