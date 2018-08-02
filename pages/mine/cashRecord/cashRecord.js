// pages/mine/cashRecord/cashRecord.js
let network = require("../../../utils/network.js")
Page({

    /**
     * 页面的初始数据
     */
    data: {
        scrollHeight: 0,
        loading: false,
        recordList: [],
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
        this.getApplyMoneyRecords();
    },

    /**
     * 
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
    getApplyMoneyRecords() {
        network.post('/api.do', {
            method: 'applyMoney/getApplyMoneyRecords',
            param: JSON.stringify({
              ajtFansId: getApp().globalData.cardFansId
            })
        }, (res) => {
          if (res.code == '0' && res.data.applyRecordList) {
                 this.setData({
                   recordList: res.data.applyRecordList
                 })
            }
            if (!res.data.applyRecordList || res.data.applyRecordList.length == 0) {
              this.setData({
                noData: true
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
    /**
     * 重新提交
     */
    againApply(e) {
       let id = e.currentTarget.dataset.id;
        network.post('/api.do', {
            method: 'applyMoney/againApplyMoney',
            param: JSON.stringify({
                applyRecordId: id
            })
        }, (res) => {
            if (res.code == '0') {
              wx.showModal({
                title: '提示',
                content: '提现申请已成功提交！',
                showCancel: false,
                success: (res2) => {
                  if (res2.confirm) {
                    this.getApplyMoneyRecords()
                  }
                }
              })
            } else {
                wx.showToast({
                    icon: 'none',
                    title: res.message || '重新提交申请失败',
                })
            }
        })
    }
})