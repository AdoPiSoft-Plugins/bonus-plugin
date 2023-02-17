const getAllBonusUrl = '/bonus-plugin/portal/all'
const collectUrl = '/bonus-plugin/portal/collect'
const getSpinUrl = '/bonus-plugin/portal/roleta-game/spin-left'
const updateRoletaUrl = '/bonus-plugin/portal/roleta-game/update'
const addRoletaBonusUrl = '/bonus-plugin/portal/roleta-game/add-bonus'

var roleta_spin_audio
var roleta_win_audio
var roleta_lose_audio

var fetchedData = []
var is_spinning = false
var is_display_win_or_lose = false
var spin_left = null
var animation
var is_playing = false
var clicked_roleta = false

function httpGet (url, cb) {
  var xmlhttp
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest()
  } else {
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
  }

  xmlhttp.onreadystatechange = function () {
    if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
      if (cb) cb(xmlhttp.responseText)
    }
  }

  xmlhttp.open('GET', url, true)
  xmlhttp.send()
}

function httpPost (url, params, cb) {
  var xmlhttp
  if (window.XMLHttpRequest) {
    xmlhttp = new XMLHttpRequest()
  } else {
    xmlhttp = new ActiveXObject('Microsoft.XMLHTTP')
  }

  xmlhttp.onload = function () {
    var data = xmlhttp.responseText
    try {
      data = JSON.parse(xmlhttp.responseText)
    } catch (e) {}
    if (cb) cb(data)
  }

  xmlhttp.open('POST', url, true)
  xmlhttp.setRequestHeader('Content-Type', 'application/json')
  xmlhttp.send(JSON.stringify(params || {}))
}

function openBonus () {
  document.querySelector('.bonus-main-icon').style = 'display: none'
  document.querySelector('.bonus-container').style = 'display: block'

  initBonusSettings(function () {
    document.querySelector('.tab-content').style = 'display: block'
  })
}

function closeBonus () {
  if (!is_spinning && !clicked_roleta) {
    document.querySelector('.bonus-main-icon').style = 'display: block'
    document.querySelector('.bonus-container').style = 'display: none'
    tabClick(1)
    closeRoleta()
     httpGet(getAllBonusUrl, function (data) {
      fetchedData = JSON.parse(data)
      const bonus = fetchedData.bonus
      if (bonus.length > 0) {
        hasUnclaim()
      } else {
        hasClaim()
      }
    })
  }
}

function createTable () {
  const rewards_div = document.querySelector('.rewards-div')
  const tableHeader = ['No.', 'Type', 'Credits', 'Option']
  let table = document.createElement('table')
  table.className = 'table table-striped bonus-table'
  let thead = document.createElement('thead')
  let headerRow = document.createElement('tr')

  tableHeader.forEach(header => {
    let th = document.createElement('th')
    th.innerText = header
    headerRow.append(th)
  })

  thead.append(headerRow)
  table.append(thead)
  rewards_div.append(table)

  for (const item of fetchedData.bonus) {
    const index = fetchedData.bonus.indexOf(item) + 1
    appendTableBody(item, index)
  }
}

function appendTableBody (item, index) {
  const table = document.querySelector('.bonus-table')
  const tbody = document.createElement('tbody')
  let tbodyRow = document.createElement('tr')

  let noTd = document.createElement('td')
  let typeTd = document.createElement('td')
  let creditsTd = document.createElement('td')
  let optionTd = document.createElement('td')

  noTd.innerText = index
  typeTd.innerText = item.type.replace('_', ' ').toUpperCase()
  creditsTd.innerText = item.bonus_mb ? item.bonus_mb.toFixed(2) + 'MB' : convertCredits(item.bonus_minutes)
  optionTd.innerHTML = '<button class="btn btn-warning btn-sm">Collect</button>'

  const btn = optionTd.firstChild

  btn.onclick = function () {
    collect(item, btn)
  }

  tbodyRow.append(noTd, typeTd, creditsTd, optionTd)
  tbody.append(tbodyRow)
  table.append(tbody)
}

function convertCredits (time) {
  const c_second = time * 60

  let sec = formatTime(c_second)
  var text = sec.seconds + ' sec'
  if (sec.minutes > 0) text = sec.minutes + ' min' + ' and ' + text
  if (sec.hours > 0) text = sec.hours + ' hr' + (sec.minutes > 0 ? ', ' : ' and ') + text
  if (sec.days > 0) text = sec.days + ' day' + (sec.days > 1 ? 's' : '') + (sec.hours > 0 || sec.minutes > 0 ? ', ' : ' and ')
  return text
}

function formatTime (secs) {
  var days, hours, mins, seconds
  secs = secs > 0 ? secs : 0
  secs = Math.round(secs)
  mins = Math.floor(secs / 60)
  seconds = secs - mins * 60
  hours = Math.floor(mins / 60)
  mins = mins - hours * 60
  days = Math.floor(hours / 24)
  hours = hours - days * 24

  return {
    days: days || 0,
    hours: hours || 0,
    minutes: mins || 0,
    seconds: seconds || 0
  }
}

function initBonusSettings (cb) {
  const loading_div = document.querySelector('.loading')
  const bonus_list = document.querySelector('.bonus-list')
  const no_reward = document.createElement('p')
  const rewards_div = document.querySelector('.rewards-div')
  const disabled_bonus_div = document.querySelector('.disabled-bonus')

  no_reward.className = 'text-danger'
  loading_div.style = 'display: block; padding-left: 10px'
  bonus_list.style.display = 'none'
  disabled_bonus_div.style = 'display: none'

  httpGet(getAllBonusUrl, function (data) {
    fetchedData = JSON.parse(data)
    loading_div.style.display = 'none'

    if (!fetchedData.config.enable_bonus) {
      disabled_bonus_div.style = 'display: block'
      bonus_list.style.display = 'none'
    } else {
      disabled_bonus_div.style = 'display: none'
      bonus_list.style.display = 'block'
      if (rewards_div) {
        rewards_div.innerHTML = ''
      }

      if (fetchedData.bonus && fetchedData.bonus.length > 0) {
        createTable(fetchedData.bonus)
      } else {
        no_reward.className = 'alert alert-danger'
        no_reward.innerText = 'No rewards yet.'
        rewards_div.append(no_reward)
      }
    }
    if (cb) cb(fetchedData)
  })
}

function collect (bonus, btn) {
  btn.textContent = 'Collecting'
  btn.disabled = true
  httpPost(collectUrl, bonus, function (data) {
    btn.textContent = 'Collect'
    btn.disabled = false
    if (data.error) {
      alert(data.error)
    }
    initBonusSettings()
    // closeBonus()
  })
}

function setBonusGame (game_div) {
  let games = []
  const game_type = ['roleta_game'] // add here the added game
  game_div.innerHTML = ''
  const config = fetchedData.config

  if (config.can_play) {
    for (const item of game_type) {
      if (config && config.hasOwnProperty(item)) {

        if (item === 'roleta_game' &&  config.roleta_game && config.roleta_game.prizes.length > 2) {
          const ct = `<span>Roleta Game. You can spin ${config.roleta_game.max_spin}x within ${config.roleta_game.reset_spin_after.replace('_', ' ')} and win prizes. Just click </span> <a onclick="initRoleta()">here.</a>`
          games.push(ct)
        }
      }
    }
    if (games.length > 0) {
      for (const item of games) {
        const index = games.indexOf(item) + 1
        const p = document.createElement('p')
        p.className = 'p_element'
        p.innerHTML = index + '. ' + item
        game_div.append(p)
      }
    } else {
      const p = document.createElement('p')
      p.className = 'alert alert-danger'
      p.innerHTML = 'No game, contact admin to add game.'
      game_div.append(p)
    }
  } else {
    const p = document.createElement('p')
    p.className = 'alert alert-info'
    p.innerHTML = `Pay more than or equal to ${config.certain_amount.bonus_amount_needed} pesos within ${(config.certain_amount.bonus_limit_days).replace('_', ' ')}, to play the game/s.`
    game_div.append(p)
  }

}

function tabClick (i) {
  const game_div = document.querySelector('.game-div')
  const rewards_div = document.querySelector('.rewards-div')
  const rewards_a = document.querySelector('.rewards')
  const game_a = document.querySelector('.game')
  const refresh_btn = document.querySelector('#refresh-btn')
  if (i === 1) {
    rewards_div.style.display = 'block'
    refresh_btn.style.display = 'block'
    game_div.style.display = 'none'
    rewards_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
    game_a.style = 'font-weight: normal; border-bottom: none'
  } else if (i === 2) {
    rewards_div.style.display = 'none'
    refresh_btn.style.display = 'none'
    game_div.style.display = 'block'
    game_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
    rewards_a.style = 'font-weight: normal; border-bottom: none'
    setBonusGame(game_div)
  }
}

function closeRoleta () {
  if (!is_spinning) {
    document.querySelector('.roleta-game').style = 'display: none'
    document.querySelector('.bonus-list').style = 'display: block'
    document.querySelector('.roleta-game').style = 'display: none'
    document.querySelector('.win-or-lose-div').style = 'display: none'
    is_display_win_or_lose = false
    stopSound()
    cancelAnimationFrame(animation)
  }
}

function initRoleta () {
  clicked_roleta = true
  cancelAnimationFrame(animation)
  document.querySelector('.loading').style = 'display: none'
  document.querySelector('.bonus-list').style = 'display: none'
  document.querySelector('.disabled-bonus').style = 'display: none'
  document.querySelector('.roleta-game-main').style.display = 'none'
  document.querySelector('.loading-roleta').style.display = 'block'
  document.querySelector('.roleta-game').style = 'display: block'

  httpGet(getAllBonusUrl, function (data) {
    fetchedData = JSON.parse(data)
    const {roleta_game} = fetchedData.config
    const {spin_bg_sound, winner_sound, loser_sound} = roleta_game.sounds
    roleta_spin_audio = setSound('spin', spin_bg_sound)
    roleta_win_audio = setSound('win', winner_sound)
    roleta_lose_audio = setSound('lose', loser_sound)

    if (roleta_game && roleta_game.prizes.length > 2) {
      setSpinSize()
      roletaGame(roleta_game)
    } else {
      window.alert('Ooops, this game is not available yet. Contact admin.')
      window.location.reload()
    }
  })
}

function setSound (dir, file_name) {
  const url = '/plugins/bonus-plugin/assets//sounds/' + dir + '/' + file_name
  return new Howl({
    src: [url],
    loop: false,
    buffer: false
  })
}

function closePopPup () {
  document.querySelector('.win-or-lose-div').style = 'display: none'
  is_display_win_or_lose = false
  stopSound()
  initRoleta()
}

function stopSound () {
  if (is_playing) {
    roleta_spin_audio.stop()
    roleta_win_audio.stop()
    roleta_lose_audio.stop()
    is_playing = false
  }
}

function getSpinLeft () {
  httpGet(getSpinUrl, function (data) {
    data = JSON.parse(data)
    spin_left = data.spin_left
    document.querySelector('.spin-left').innerText = `Spin Left: ${spin_left}`
    document.querySelector('.loading-roleta').style.display = 'none'
    document.querySelector('.roleta-game-main').style.display = 'block'
    clicked_roleta = false

    if (spin_left <= 0 && !is_display_win_or_lose) {
      const running_out_of_spin = document.querySelector('.running-out-spin')
      running_out_of_spin.style.display = 'block'
      running_out_of_spin.innerHTML = `
        <h3 class="text-danger">You're running out of spin. Try again ${resetAfter()}.</h3>
        <button onclick="closeRoleta()" class="btn btn-default btn-sm" style="margin-top: 20px">Close</button>
      `
    } else {
      document.querySelector('.running-out-spin').style.display = 'none'
    }
  })
}

function resetAfter () {
  const {roleta_game} = fetchedData.config
  const {reset_spin_after} = roleta_game
  if (reset_spin_after === 'today') return 'tomorrow'
  else if (reset_spin_after === 'this_week') return 'next week'
  else if (reset_spin_after === 'this_month') return 'next month'
}

function roletaGame (roleta_game) {
  getSpinLeft()
  const prizes = roleta_game.prizes
  const rand = (m, M) => Math.random() * (M - m) + m
  const all_prizes = prizes.length
  const wheel_spin = document.querySelector('#spin')
  const wheel = document.querySelector('#wheel').getContext('2d')
  const win_or_lose = document.querySelector('.win-or-lose-div')
  const dia = wheel.canvas.width
  const rad = dia / 2
  const PI = Math.PI
  const TAU = 2 * PI
  const arc = TAU / prizes.length
  const friction = 0.995
  let angVel = 0
  let ang = 0

  const getIndex = () => Math.floor(all_prizes - ang / TAU * all_prizes) % all_prizes

  function drawSector (sector, i) {
    const ang = arc * i
    wheel.save()

    wheel.beginPath()
    wheel.fillStyle = sector.color
    wheel.moveTo(rad, rad)
    wheel.arc(rad, rad, rad, ang, ang + arc)
    wheel.lineTo(rad, rad)
    wheel.fill()

    wheel.translate(rad, rad)
    wheel.rotate(ang + arc / 2)
    wheel.textAlign = 'right'
    wheel.fillStyle = '#fff'
    wheel.font = 'bold 23px sans-serif'
    wheel.fillText(sector.prize_text, rad - 10, 10)
    wheel.restore()
  }

  function winner (prize) {
    const {is_admin_prize, bonus_minutes, bonus_mb, prize_text} = prize
    is_playing = true
    roleta_win_audio.play()
    win_or_lose.style = 'display: block'

    if (!is_admin_prize) {
      httpPost(addRoletaBonusUrl, {bonus_minutes, bonus_mb}, function () {})

      win_or_lose.innerHTML = `
        <h3 class="text-success">Congratulations, you won ${prize_text}!</h3>
        <br>
        <p>You can claim this reward to REWARDS tab. </p>
        <div class="text-center" style="margin-top: 10px">
          <button class="btn btn-default" onclick="closePopPup()">close</button>
        </div>
      `
    } else {
      win_or_lose.innerHTML = ` 
        <h3 class="text-success">Congratulations, you won ${prize_text}!</h3>
        <br>
        <p>Contact your admin for your reward. Screenshot this for the proof.</p>
        <div class="text-center" style="margin-top: 10px">
          <button class="btn btn-default" onclick="closePopPup()">close</button>
        </div>
      `
    }
  }

  function lose () {
    is_playing = true
    roleta_lose_audio.play()
    win_or_lose.style = 'display: block'
    win_or_lose.innerHTML = ` 
      <h3 class="text-danger">You lose, Try another spin.</h3>
      <div class="text-center" style="margin-top: 10px">
        <button class="btn btn-default" onclick="closePopPup()">close</button>
      </div>
    `
  }

  function rotate () {
    const sector = prizes[getIndex()]
    wheel.canvas.style.transform = `rotate(${ang - PI / 2}rad)`
    wheel_spin.style.background = sector.color
    if (!angVel && is_spinning) {
      is_spinning = false
      is_display_win_or_lose = true
      if (sector.has_prize) {
        winner(sector)
      } else {
        lose()
      }
    }
  }
  function frame () {
    if (!angVel) return
    angVel *= friction // Decrement velocity by friction
    if (angVel < 0.002) {
      angVel = 0 // Bring to stop
      roleta_spin_audio.stop()
      is_playing = false
    }
    ang += angVel // Update angle
    ang %= TAU // Normalize angle
    rotate()
  }

  function start () {
    frame()
    animation = requestAnimationFrame(start)
  }
  rotate() // Initial rotation
  start()
  prizes.forEach(drawSector)

  wheel_spin.addEventListener('click', () => {
    if (!angVel && !is_display_win_or_lose && spin_left > 0) {
      prizes.forEach(drawSector)
      is_playing = true
      is_spinning = true
      roleta_spin_audio.play()
      angVel = rand(1, 5)
      httpPost(updateRoletaUrl, null, function () {})
    }
  })
}

function setSpinSize() {
  const config = fetchedData.config
  if (config.roleta_game && config.roleta_game.prizes) {
    const wheel_spin = document.querySelector('#spin')
    if (config.roleta_game.prizes.length > 15) {
      wheel_spin.style.font = "12px sans-serif"
      wheel_spin.style.width  = "12%"
      wheel_spin.style.height =  "12%"
      wheel_spin.style.top = "52%"
      wheel_spin.style.left = "52%"
    }
  }
}

function hasUnclaim () {
  const unclaim_indicator = document.querySelector('.unclaim-indicator')
  unclaim_indicator.style.display = ''
}

function hasClaim () {
  const unclaim_indicator = document.querySelector('.unclaim-indicator')
  unclaim_indicator.style.display = 'none'
}

(function () {
  'use strict'
  setTimeout(() => {
    if (!document.getElementById('bonus-plugin')) {
      var bonus_plugin = document.createElement('div')
      bonus_plugin.id = 'bonus-plugin'
      httpGet('/plugins/bonus-plugin/views/portal/bonus.html?href=' + (new Date()).getMonth(), function (html) {
        bonus_plugin.innerHTML = html
        var body = document.querySelector('body')
        body.append(bonus_plugin)

        httpGet(getAllBonusUrl, function (data) {
          fetchedData = JSON.parse(data)
          const bonus = fetchedData.bonus

          if (bonus.length > 0) {
            hasUnclaim()
          } else {
            hasClaim()
          }
        })

      })
    }
  }, 1e3)
})()
