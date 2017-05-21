module.exports = {
  entry: './app.js',
  output: {
    filename: 'bundle.js'
  },

  module: {
    loaders:[
      {  //摘自阮一峰，避免控制台报错
        test: /\.js[x]?$/,
        exclude: /node_modules/,
        loader: 'babel-loader?presets[]=es2015&presets[]=react'
      },
      { //渲染CSS
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  //Vue独立构建
  resolve: {
      alias: {
          'vue$': 'vue/dist/vue.common.js'
      }
  }
}