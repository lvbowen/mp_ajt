let network = require("../../../utils/network.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        scrollHeight: 0,
        loading: false,
        moneyRecords: [],
        noData:false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.getSystemInfo({
            success: (res) => {
                this.setData({
                    scrollHeight: res.windowHeight
                })
            }
        })
        this.getMoneyRecordsList();

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
     * 获取列表
     */
    getMoneyRecordsList() {
        network.post('/api.do', {
            method: 'moneyRecords/getMoneyRecordsList',
            param: JSON.stringify({
              ajtFansId: getApp().globalData.cardFansId
            })
        }, (res) => {
          if (res.code == '0' && res.data.moneyRecords){
            this.setData({
              moneyRecords: res.data.moneyRecords
            })
          }
          if (!res.data.moneyRecords || res.data.moneyRecords.length == 0){
            this.setData({
              noData:true
            })
          }
        })
    },
    /**
     * 加载更多
     */
    loadMore() {
        console.log('loadMore')
        this.setData({
            loading: true
        })
        setTimeout(() => {
            this.setData({
                loading: false
            })
        }, 2000)
    },

})