const router = require('./router.js')
const { app, on_activation_ready, is_plugin_paid } = require('../core.js')
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

        const cfg = await config.read();
        cfg.enable_bonus = false
        cfg.can_play = false
        await config.save(cfg)
      } catch (e) {
        console.log(e)
      }
    })

  },
  uninstall () {}

}
