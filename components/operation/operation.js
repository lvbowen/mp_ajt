// components/operation/operation.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
      open:{
        type:Boolean
      },
      operationArr:{
        type:Array
      }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // open:false
  },

  /**
   * 组件的方法列表
   */
  methods: {
    _closed:function(){
      this.setData({
        open:false
      })
      wx.showTabBar();
    },
    _onTap: function (e) {
      var myEventDetail = e.currentTarget.dataset; // detail对象，提供给事件监听函数
      var myEventOption = {} // 触发事件的选项
      this.triggerEvent('myevent', myEventDetail, myEventOption)
    }
  }
})
