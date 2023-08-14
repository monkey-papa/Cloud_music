module.exports = {
  //  此处省略无数行，已有的的其他的内容
  module: {
    rules: [
      //  此处省略无数行，已有的的其他的规则
      {
        test: /\.less$/,
        loader: "style-loader!css-loader!less-loader",
      }
    ]
  }
}