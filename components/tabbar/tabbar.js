
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    currentIndex: {
      type: String,
      value: '0'
    },
    otherCardId:Number || String,
    otherFansId: Number || String,
    otherCId: String || Number,
    fromPage:String
  },

  /**
   * 组件的初始数据
   */
  data: {
    
  },
  /**
   * 组件生命周期
   */
  attached() {

  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 切换tabbar菜单
     */
    _switchTab(e){ 
      let { idx } = e.currentTarget.dataset;
      if (idx == this.data.currentIndex){
        return;
      }
      if(idx === '0'){
          wx.redirectTo({
            url: `/pages/card/shareCard/shareCard?fansId=${this.data.otherFansId}&cardId=${this.data.otherCardId}&fromPage=${this.data.fromPage}`,
          })
      }else if(idx === '1'){
        wx.redirectTo({
          url: `/pages/home/newHome/newHome?cId=${this.data.otherCId}&fansId=${this.data.otherFansId}&cardId=${this.data.otherCardId}&fromPage=${this.data.fromPage}`,
        })
      }
    }
  }
})
