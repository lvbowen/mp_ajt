
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        position: {
            type: String,
            value: 'absolute'
        },
        showBack: {
            type: String,
        },
        title: {
            type: String,
            value: ''
        },
        color: {
            type: String,
            value: 'black'
        },
    },

    /**
     * 组件的初始数据
     */
    data: {
      system:'iOS'
    },
    /**
     * 组件生命周期
     */
    attached() {
      // try {
      //   var res = wx.getSystemInfoSync()
      //   console.log(res)
      //   if (res.system.indexOf('Android') > -1){
      //     this.setData({
      //       system:'Android'
      //     })
      //   }
      // } catch (e) {
      //   // Do something when catch error
      // }
    },

    /**
     * 组件的方法列表
     */
    methods: {
        _back: function () {          
            if (getCurrentPages().length > 1){    //防止分享打开的页面点击箭头报错
              wx.navigateBack()
            }else{
              this.triggerEvent('backEvent')
            }            
        },
    }
})
