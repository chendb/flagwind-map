namespace flagwind {

    /**
     * 业务图层数据服务接口
     */
    export interface IFlagwindBusinessService {

        changeStandardModel(model: any): any;

        getInfoWindowContext(mode: any): { title: string; content: string };
        /**
         * 获取图层
         */
        getDataList(): Promise<Array<any>>;

        /**
         * 获取最新图层数据状态
         */
        getLastStatus(): Promise<Array<any>>;
    }
}
