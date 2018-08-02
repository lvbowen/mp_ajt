// pages/generation/searchAddress/searchAddress.js

var amapFile = require('../../../utils/amap-wx.js');
var utils = require('../../../utils/util.js');
var amapKey = '519819b794296fda61370f3c4d045ff6';
var myAmapFun = new amapFile.AMapWX({ key: amapKey });

Page({

    /**
     * 页面的初始数据
     */
    data: {
        pdHeight: utils.rpxHeight(),
        openLocation: true,
        currentCity: {
            city: '定位',
            citycode: '010',
            location: ''
        },
        keywords: '',
        tips: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getRegeo()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },
    /**
     * 开启定位设置
     */
    openLocationSetting: function () {
        wx.openSetting({
            success: (res) => {
                if (res.authSetting['scope.userLocation']) {
                    this.setData({
                        openLocation: true,
                        keywords: '',
                    })
                    setTimeout(() => {   //增加延时确保定位功能生效
                        this.getRegeo()
                    }, 500)
                } else {
                    this.setData({
                        openLocation: false,
                        keywords: '',
                    })
                }
            }
        })
    },
    /**
     * 逆地址编码
     */
    getRegeo() {
        let _this = this;
        //会弹是否允许获取地理位置框
        myAmapFun.getRegeo({
            success: function (data) {
                //确定成功回调
                let _data = data[0].regeocodeData.addressComponent
                _this.setData({
                    currentCity: { city: _data.city, citycode: _data.citycode, location: _data.streetNumber.location }
                })
                _this.getInputtips();
            },
            fail: function (info) {
                //拒绝失败回调
                // if (info.errMsg == 'getLocation:fail auth deny'){
                _this.setData({
                    openLocation: false
                })
                // }       
            }
        })
    },
    /**
     * 输入提示
     */
    getInputtips() {
        let _this = this;
        myAmapFun.getInputtips({
            keywords: _this.data.keywords || _this.data.currentCity.city,
            city: _this.data.currentCity.citycode,
            citylimit: true,
            location: _this.data.currentCity.location,
            success: function (data) {
                if (data.tips && data.tips.length > 0) {
                    _this.setData({
                        tips: data.tips
                    })
                }
            }
        })
    },
    /**
     * 根据关键词提示
     */
    getTips(e) {
        let keywords = e.detail.value.trim();
        if (e.detail.cursor > 0) {
            this.setData({
                keywords: keywords
            })
            this.getInputtips()
        }
    },
    /**
     * 选择地址
     */
    selectAddress(e) {
        let item = e.currentTarget.dataset.item
        let arr = item.location.split(',');
        let address = ''
        if (typeof address === 'string') {
            address = item.address;
        }
        getApp().globalData.companyAddress = item.district + address;
        getApp().globalData.longlat = { longitude: arr[0], latitude: arr[1] };
        console.log('longlat', getApp().globalData.longlat)
        wx.navigateBack()
    }
})