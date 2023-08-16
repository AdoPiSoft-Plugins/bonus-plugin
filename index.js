const router = require('./router.js')
const { app, on_activation_ready, is_plugin_paid, plugin_config} = require('../core.js')
const models = require('./models')
const config = require('./config.js')

module.exports = {
  async init (id, plugin_name) {
    config.id = id
    await models.init()
    app.use(router)
    on_activation_ready(async () => {
      try {
        if(await is_plugin_paid(plugin_name)) return

        const cfg = {
          enable_bonus: false,
          can_play: false
        }
        await plugin_config.updatePlugin(id, cfg);
      } catch (e) {
        console.log(e)
      }
    })

  },
  uninstall () {}

}
