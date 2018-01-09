/**
 * 地图配置
 *
 * @export
 * @class MapSetting
 */


export const MapSetting = {
    baseUrl:'',
    arcgisApi: "http://js.arcgis.com/3.21/",
    wkid: 102100, // 生产环境使用
    routeUrl: "http://27.17.34.22:6080/arcgis/rest/services/dongying_nd/NAServer/Route",
    extent:[],
    // 测试环境配置
    basemap: "dark-gray-vector", // 底图服务（优先级0）
    webTiledUrl: '',
    units: 0.003,// 用于地图距离求解单位控件参数
    center: [118.51393127, 37.44189835], // 中心坐标
    wkidFromApp: 4326, // app中使用的空间投影（允许业务中使用的投影与地图的不一样，程序会自动转换）
    is25D: false, // 是否为2.5D地图
    minZoom: 8,
    maxZoom: 19,
    zoom: 9,
    logo: false,  // 是否显示logo
    slider: false // 是否显示放大缩小按钮
}
