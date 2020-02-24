# mp_ajt
名片分销小程序，包含授权手机号、模板消息、图片上传裁剪、生成朋友圈分享图片（海报）、高德地图sdk应用等功能。

### 小程序需注意点   
1、使用背景图background:url()，模拟器中正常，但真机预览的时候背景图并不会显示，可以使用image,然后绝对定位；  
2、数据渲染时，重复的数据只会渲染一遍；  
3、require()引入js时，不能使用绝对路径，只能使用相对路径，import引入文件时，相对绝对都可以；  
4、wxml最外层是有个page标签的，编辑看不到，调试的时候可以看到，必要的时候可以对这个标签设置样式；  
### 小程序技巧    
1、app.json中注册页面后，会直接在所设置的路径位置自动生成对应的文件夹和文件；   
2、最好使用[flex](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html?utm_source=tuicool)布局，官方默认项目也是使用的flex布局；   
3、template模板中的图片路径使用绝对路径比较好；    
4、下拉刷新使用：onPullDownRefresh，上拉加载更多使用：scroll-view中的bindscrolltolower；
