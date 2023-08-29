const bonus_sessions = require('../services/bonus_sessions.js')
const config = require('../config.js')
const roleta_game = require('../services/roleta_game.js')
const core = require('../../core')
const { sessions_manager, devices_manager } = core

exports.init = async (req, res, next) => {
  try {
    let { device, customer } = req

    customer = customer || {id: null}
    const bonus = await bonus_sessions.load(device, customer)
    const cfg = bonus.config || {}
    cfg.roleta_game.game_icon = await config.imageFilename(null, 'roleta_game')
    cfg.flip_game.game_icon = await config.imageFilename(null, 'flip_game')
    bonus.config = cfg
    res.json(bonus)
  } catch (e) {
    next(e)
  }
}

exports.collect = async (req, res, next) => {
  try {
    const params = req.body
    const cfg = await config.read()
    if (!cfg.enable_bonus) {
      return res.json({error: 'Bonus is temporarily disabled by the administrator.'})
    }

    let { device, customer } = req
    customer = customer || {id: null}
    await bonus_sessions.collect(params, device, customer)
    res.json({success: true})
  } catch (e) {
    next(e)
  }
}

exports.getSpinLeft = async (req, res, next) => {
  try {
    let { device, customer } = req
    customer = customer || {id: null}
    const spin_left = await roleta_game.get(device, customer)
    res.json({ spin_left })
  } catch (e) {
    next(e)
  }
}
exports.update = async (req, res, next) => {
  try {

    let { device, customer } = req
    customer = customer || {id: null}
    await roleta_game.update(device, customer)

    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.addBonus = async (req, res, next) => {
  try {
    let { device, customer } = req
    customer = customer || {id: null}
    const params = req.body
    await bonus_sessions.addBonus(params, device, customer)
    res.json({success: true})
  } catch (e) {
    console.log(e)
    next(e)
  }
}

exports.getAvailableSessions = async (req, res, next) => {
  try {
    const { customer } = req
    let sessions = customer
      ? await sessions_manager.getCustomerSessions(customer.id)
      : await sessions_manager.getDeviceSessions(req.device)

    sessions = sessions.filter(s => {
      if(s.status == 'available'){
        s = s.toJSON()
        return s
      }
    });

    let cfg = await config.read();
    cfg.flip_game.first_choice_icon = await config.imageFilename('first-choice', 'flip_game')
    cfg.flip_game.second_choice_icon = await config.imageFilename('second-choice', 'flip_game')
    cfg.flip_game.game_icon = await config.imageFilename(null, 'flip_game')

    res.json({sessions, config: cfg});
  } catch (e)
  {
    console.log(e)
    next(e)
  }
}

exports.removeSession = async (req, res, next) => {
  try {
    var { id, amount, type } = req.body
    id = parseInt(id)
    amount = type === 'time' ? parseInt(amount) * 60 : parseInt(amount)
    
    let session = await sessions_manager.findSession(id)
    session = session.db_instance || null
    if (!session) throw new Error('Session not found')

    const session_amount = type === 'time' ? session.remaining_time_seconds : session.remaining_data_mb

    // if user bet all amount in choosen session, delete session
    if (session_amount - amount === 0) {
      const device_id = parseInt(req.device.db_instance.id);
      const device = await devices_manager.loadDevice(device_id)
      await sessions_manager.removeDeviceFromSession(id, device)
      if(!await sessions_manager.hasRunningSession(device)){
        await device.disconnect()
      }
    } else { // deduct only
      const data = {}
      if (type === 'time'){
        data.time_seconds = session.time_seconds - amount
      }else {
        data.data_mb = session.data_mb - amount
      }
      session.update(data)
    }
    res.json({ success: true})
  } catch (e)
  {
    console.log(e)
    next(e)
  }
}