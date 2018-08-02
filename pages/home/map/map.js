// pages/home/map/map.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    companyInfo:null,
    markers: [{
      iconPath: "/images/location-icon.png",
      id: 0,
      latitude: 30.293568,
      longitude: 120.06678,
      width: 30,
      height: 30,
      // callout:{
      //   content:"",
      //   color:"#000",
      //   fontSize:13,
      //   borderRadius:5,
      //   bgColor:"#ffffff",
      //   padding:8,
      //   display: 'ALWAYS'
      // },
    }],

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let marker = this.data.markers[0]
    options.address = options.address == 'null' ? '' : options.address;
    marker.latitude = parseFloat(options.latitude)
    marker.longitude = parseFloat(options.longitude)  
    // marker.callout.content = `${options.companyName}\n${options.address}`
    let _this = this;
    this.setData({
      companyInfo:options,
      markers: _this.data.markers
    })
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
  regionchange(e) {
    // console.log(e.type)
  },
  markertap(e) {
    // console.log(e.markerId)
  },
  controltap(e) {
    // console.log(e.controlId)
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
   * 用户点击右上角分享
   */
  // onShareAppMessage: function () {
  
  // }
})