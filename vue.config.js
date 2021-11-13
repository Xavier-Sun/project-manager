module.exports = {
  transpileDependencies: [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  },
  chainWebpack: config => {
    config
      .plugin("html")
      .tap(args => {
        args[0].title = "Project Manager"
        return args
      })
  },
}
