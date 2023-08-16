var getAllBonusUrl = '/bonus-plugin/portal/all'
var collectUrl = '/bonus-plugin/portal/collect'
var getSpinUrl = '/bonus-plugin/portal/roleta-game/spin-left'
var updateRoletaUrl = '/bonus-plugin/portal/roleta-game/update'
var addBonusUrl = '/bonus-plugin/portal/add-bonus'
var sessionsUrl = '/bonus-plugin/portal/flip-game/get-sessions'
var removeSessionUrl = '/bonus-plugin/portal/flip-game/remove-session'

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
var flip_game_started = false
const flip_game_bet = {}

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
  if (!is_spinning && !clicked_roleta && !flip_game_started) {
    document.querySelector('.bonus-main-icon').style = 'display: block'
    document.querySelector('.bonus-container').style = 'display: none'
    var complete_challenge_text = document.querySelector('.complete-challenge-text')
    if (complete_challenge_text) {
      complete_challenge_text.remove()
    }
    tabClick(1)
    closeRoleta()
  }
}

function createTable () {
  var rewards_div = document.querySelector('.rewards-div')
  var tableHeader = ['No.', 'Type', 'Credits', 'Option']
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

  for (var item of fetchedData.bonus) {
    var index = fetchedData.bonus.indexOf(item) + 1
    appendTableBody(item, index)
  }
}

function appendTableBody (item, index) {
  var table = document.querySelector('.bonus-table')
  var tbody = document.createElement('tbody')
  let tbodyRow = document.createElement('tr')

  let noTd = document.createElement('td')
  let typeTd = document.createElement('td')
  let creditsTd = document.createElement('td')
  let optionTd = document.createElement('td')

  noTd.innerText = index
  typeTd.innerText = item.type.replace(/[._]/g, ' ').toUpperCase()
  creditsTd.innerText = item.bonus_mb > 0 && item.bonus_minutes > 0 ? item.bonus_mb.toFixed(2) + 'MB or ' + convertCredits(item.bonus_minutes) : (item.bonus_mb ? item.bonus_mb.toFixed(2) + 'MB' : convertCredits(item.bonus_minutes));
  optionTd.innerHTML = '<button class="btn btn-warning btn-sm">Collect</button>'

  var btn = optionTd.firstChild

  btn.onclick = function () {
    collect(item, btn)
  }

  tbodyRow.append(noTd, typeTd, creditsTd, optionTd)
  tbody.append(tbodyRow)
  table.append(tbody)
}

function convertCredits (time) {
  var c_second = time * 60

  let sec = formatTime(c_second)
  var text = sec.seconds + ' sec'
  if (sec.minutes > 0) text = sec.minutes + ' min' + ' and ' + text
  if (sec.hours > 0) text = sec.hours + ' hr' + (sec.minutes > 0 ? ', ' : ' and ') + text
  if (sec.days > 0) text = sec.days + ' day' + (sec.days > 1 ? 's' : '') + (sec.hours > 0 || sec.minutes > 0 ? ', ' : ' and ') + text
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
  var loading_div = document.querySelector('.loading')
  var bonus_list = document.querySelector('.bonus-list')
  var no_reward = document.createElement('p')
  var rewards_div = document.querySelector('.rewards-div')
  var disabled_bonus_div = document.querySelector('.disabled-bonus')

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
      document.querySelector('.bonus-main-icon').style = 'display: block'
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
  var game_type = ['roleta_game', 'flip_game'] // add here the added game

  game_div.style = 'display: flex; justify-content: space-around; flex-wrap: wrap;'
  game_div.innerHTML = ''
  var config = fetchedData.config

  if (config.can_play) {
    for (var item of game_type) {
      if (config && config.hasOwnProperty(item)) {

        if (item === 'roleta_game' &&  config.roleta_game && config.roleta_game.prizes.length > 2 && config.roleta_game.max_spin) {
          const ct = {
            content: `You can spin ${config.roleta_game.max_spin}x within ${config.roleta_game.reset_spin_after.replace('_', ' ')} and win prizes.`,
            title: 'Roleta Game',
            imgSrc: '/plugins/bonus-plugin/assets/images/roleta/' + config.roleta_game.game_icon,
            funcButton: 'initRoleta()'
          }
          games.push(ct) 

        }
        if(item === 'flip_game' && config.flip_game && config.flip_game.enable){
          const ct = {
            content: `You can bet your available session and have a chance to double it. Minimum of ${config.flip_game.min_mins_session} mins. or ${config.flip_game.min_mb_session} MB session.`,
            title: 'Flip Game',
            imgSrc: '/plugins/bonus-plugin/assets/images/flip/' + config.flip_game.game_icon,
            funcButton: 'initFlipGame()'
          }
          games.push(ct)
          games.push(ct1)
        }
      }
    }
    if (games.length > 0) {
      for (var item of games) {
        var index = games.indexOf(item) + 1
        const game_container = document.createElement('div')
        game_container.className = "game-container"
        game_container.id = index + '-game'
        game_container.innerHTML = `
        <div class="game-container-content">
          <div class="img-container">
            <img src="${item.imgSrc}">
          </div>
          <p id="title">${item.title}</p>
          <small>${item.content}</small>
          <button class="btn btn-success" onclick="${item.funcButton}">Play</button>
        </div>
        `
        game_div.append(game_container)
      }
    } else {
      var p = document.createElement('p')
      p.className = 'alert alert-danger'
      p.innerHTML = 'No game, contact admin to add game.'
      game_div.append(p)
    }
  } else if(!config.can_play && config.certain_amount) {
    var p = document.createElement('p')
    p.className = 'alert alert-info'
    var challenge_text = config.certain_amount.custom_challenge_text ? config.certain_amount.custom_challenge_text : `Pay more than or equal to ${config.certain_amount.bonus_amount_needed} pesos within ${(config.certain_amount.bonus_limit_days).replace('_', ' ')}, to play the game/s.`
    p.innerHTML = challenge_text
    game_div.append(p)
  } else {
    var p = document.createElement('p')
    p.className = 'alert alert-danger'
    p.innerHTML = '<a href="javascript:window.location.reload()">Something went wrong? Click here to reload the page</a>'
    game_div.append(p)
  }

}

function tabClick (i) {
  var game_div = document.querySelector('.game-div')
  var rewards_div = document.querySelector('.rewards-div')
  var rewards_a = document.querySelector('.rewards')
  var game_a = document.querySelector('.game')
  var refresh_btn = document.querySelector('#refresh-btn')
  if (i === 1) {
    rewards_div.style.display = 'block'
    refresh_btn.style.display = 'block'
    game_div.style.display = 'none'
    rewards_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
    game_a.style = 'font-weight: normal; border-bottom: none'
  } else if (i === 2) {
    rewards_div.style.display = 'none'
    refresh_btn.style.display = 'none'
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

  var roleta_game_div = document.querySelector('.roleta-game')
  roleta_game_div.style = 'display: block'

  httpGet(getAllBonusUrl, function (data) {
    fetchedData = JSON.parse(data)
    var { roleta_game, can_play } = fetchedData.config

    if (!can_play) {
      clicked_roleta = false
      flip_game_started = false
      document.querySelector('.loading-roleta').style.display = 'none'
      var p = document.createElement('p')
      p.className = 'alert alert-danger text-center complete-challenge-text'
      p.innerHTML = '<a onclick="refresh()">Ooops, complete the challenge first!</a>'
      roleta_game_div.append(p)
      return;
    }

    var { spin_bg_sound, winner_sound, loser_sound } = roleta_game ? roleta_game.sounds : {}
    if (spin_bg_sound && winner_sound && loser_sound) {
      roleta_spin_audio = setSound('spin', spin_bg_sound)
      roleta_win_audio = setSound('win', winner_sound)
      roleta_lose_audio = setSound('lose', loser_sound)
    }

    if (roleta_game && roleta_game.prizes.length > 2) {
      setSpinSize()
      roletaGame(roleta_game)
    } else {
      window.alert('Ooops, this game is not available yet. Contact admin.')
      window.location.reload()
    }
  })
}

function refresh() {
  var game_div = document.querySelector('.game-div')
  var roleta_game_div = document.querySelector('.roleta-game')
  roleta_game_div.style.display = 'none'
  var complete_challenge_text = document.querySelector('.complete-challenge-text')
  if (complete_challenge_text) {
    complete_challenge_text.remove()
  }

  setBonusGame(game_div)
  initBonusSettings()
}

function setSound (dir, file_name) {
  var url = '/plugins/bonus-plugin/assets//sounds/' + dir + '/' + file_name
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
      var running_out_of_spin = document.querySelector('.running-out-spin')
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
  var {roleta_game} = fetchedData.config
  var {reset_spin_after} = roleta_game
  if (reset_spin_after === 'today') return 'tomorrow'
  else if (reset_spin_after === 'this_week') return 'next week'
  else if (reset_spin_after === 'this_month') return 'next month'
}

function gotToCollect () {
  var game_div = document.querySelector('.game-div')
  var rewards_div = document.querySelector('.rewards-div')
  var rewards_a = document.querySelector('.rewards')
  var game_a = document.querySelector('.game')
  var refresh_btn = document.querySelector('#refresh-btn')
  document.querySelector('.flip-game').style.display = 'none'
  
  rewards_div.style.display = 'block'
  refresh_btn.style.display = 'block'
  game_div.style.display = 'none'
  rewards_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
  game_a.style = 'font-weight: normal; border-bottom: none'

  closeRoleta()
  initBonusSettings()
}

function roletaGame (roleta_game) {
  getSpinLeft()
  var prizes = roleta_game.prizes
  var rand = (m, M) => Math.random() * (M - m) + m
  var all_prizes = prizes.length
  var wheel_spin = document.querySelector('#spin')
  var wheel = document.querySelector('#wheel').getContext('2d')
  var win_or_lose = document.querySelector('.win-or-lose-div')
  var dia = wheel.canvas.width
  var rad = dia / 2
  var PI = Math.PI
  var TAU = 2 * PI
  var arc = TAU / prizes.length
  var friction = 0.995
  let angVel = 0
  let ang = 0

  var getIndex = () => Math.floor(all_prizes - ang / TAU * all_prizes) % all_prizes

  function drawSector (sector, i) {
    var ang = arc * i
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
    let prize_log_text = ''
    var {is_admin_prize, bonus_minutes, bonus_mb, prize_text} = prize
    is_playing = true
    roleta_win_audio.play()
    win_or_lose.style = 'display: block'

    if (!is_admin_prize) {
      prize_log_text = (bonus_minutes > 0 ? convertCredits(bonus_minutes) : bonus_mb.toFixed(2) + 'MB') + ' free session'
      win_or_lose.innerHTML = `
        <h3 class="text-success">Congratulations, you won ${prize_text}!</h3>
        <br>
        <div class="text-center" style="margin-top: 10px;">
          <button class="btn btn-primary mr-2" onclick="gotToCollect()">Collect</button>
          <button class="btn btn-success" onclick="closePopPup()">Play</button>
        </div>
      `
    } else {
      prize_log_text = `Admin Prize(${prize_text})`
      win_or_lose.innerHTML = ` 
        <h3 class="text-success">Congratulations, you won ${prize_text}!</h3>
        <br>
        <p>Contact admin for your reward. Screenshot this for the proof.</p>
        <div class="text-center" style="margin-top: 10px">
          <button class="btn btn-success" onclick="closePopPup()">Play</button>
        </div>
      `
    }

    httpPost(addBonusUrl, {bonus_minutes, bonus_mb, prize_log_text, game: 'Roleta Game'}, function () {})
  }

  function lose () {
    is_playing = true
    roleta_lose_audio.play()
    win_or_lose.style = 'display: block'
    win_or_lose.innerHTML = ` 
      <h3 class="text-danger">You lose, try another spin.</h3>
      <div class="text-center" style="margin-top: 10px">
        <button class="btn btn-success" onclick="closePopPup()">Play</button>
      </div>
    `
  }

  function rotate () {
    var sector = prizes[getIndex()]
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
    if (angVel < 0.0005) {
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
  var config = fetchedData.config
  if (config.roleta_game && config.roleta_game.prizes) {
    var wheel_spin = document.querySelector('#spin')
    if (config.roleta_game.prizes.length > 15) {
      wheel_spin.style.font = "12px sans-serif"
      wheel_spin.style.width  = "12%"
      wheel_spin.style.height =  "12%"
      wheel_spin.style.top = "52%"
      wheel_spin.style.left = "52%"
    }
  }
}


// Flip game
function closeFlipGame()
{
  document.querySelector('.flip-game').style = 'display: none'
  document.querySelector('.win-or-lose-div').style = 'display: none'
  document.querySelector('.flip-game-win-or-lose-div').style = 'display: none'
  document.querySelector('.loading-flip-game').style = 'display: none'
  document.querySelector('.bonus-list').style = 'display: block'
  flip_game_started = false;
}

function initFlipGame()
{
  flip_game_started = false;
  document.querySelector('.loading').style = 'display: none'
  document.querySelector('.bonus-list').style = 'display: none'
  document.querySelector('.disabled-bonus').style = 'display: none'
  document.querySelector('.flip-game-error-div').style.display = 'none'
  document.querySelector('.flip-game-main').style.display = 'none'
  document.querySelector('.flip-game-win-or-lose-div').style = 'display: none'
  document.querySelector('.flip-game-main-containers').style = "pointer-events: ''; opacity: 1";
  document.querySelector('.start-flip-btn').disabled = true;
  document.querySelector('.session-select').disabled = true;

  document.querySelector('.loading-flip-game').style.display = 'block'
  document.querySelector('.choices-image-container').style.animation = 'none';

  const first_choice_btn = document.querySelector('.first-choice-btn')
  first_choice_btn.disabled = false;
  first_choice_btn.classList.remove('active')
  const second_choice_btn = document.querySelector('.second-choice-btn')
  second_choice_btn.disabled = false;
  second_choice_btn.classList.remove('active')

  var roleta_game_div = document.querySelector('.roleta-game')
  var flip_game_div = document.querySelector('.flip-game')
  roleta_game_div.style = 'display: none'
  flip_game_div.style = 'display: block'

  loadSessionData(first_choice_btn, second_choice_btn);
}

function loadSessionData(first_choice_btn, second_choice_btn)
{
  httpGet(sessionsUrl, function(data){
    data = JSON.parse(data);
    const sessions = data.sessions;
    const config = data.config;

    if (!config.can_play) {
      var p = document.createElement('p')
      p.className = 'alert alert-info'
      var challenge_text = config.certain_amount.custom_challenge_text ? config.certain_amount.custom_challenge_text : `Pay more than or equal to ${config.certain_amount.bonus_amount_needed} pesos within ${(config.certain_amount.bonus_limit_days).replace('_', ' ')}, to play the game/s.`
      p.innerHTML = challenge_text

      return;
    }

    first_choice_btn.innerText = config.flip_game.first_choice_text;
    second_choice_btn.innerText = config.flip_game.second_choice_text;
    document.querySelector('.flip-game-title').innerText = "Choose " + config.flip_game.first_choice_text + " or " + config.flip_game.second_choice_text;
    document.querySelector('.minimum-bet').innerText = 'minimum minutes: ' + config.flip_game.min_mins_session + " | minimum MB: " + config.flip_game.min_mb_session;

    document.querySelector('.front-image').src="/plugins/bonus-plugin/assets/images/flip/first-choice/" + config.flip_game.first_choice_icon;
    document.querySelector('.back-image').src="/plugins/bonus-plugin/assets/images/flip/second-choice/" + config.flip_game.second_choice_icon;
    document.querySelector('.flip-game-main').style.display = 'block'
    document.querySelector('.loading-flip-game').style.display = 'none'
    const session_select = document.querySelector('.session-select')
    session_select.innerHTML = "";

    const session_data = [{value: '', label: "-- Choose Session --"}];
    sessions.forEach(s => {
      var label;
      const minutes = Math.floor(s.remaining_time_seconds/60);

      if(s.type === 'time' && parseInt(minutes) >= parseInt(config.flip_game.min_mins_session)) {
        label = convertCredits(minutes);
      } else if(s.type === 'data' && parseInt(s.remaining_data_mb) >= parseInt(config.flip_game.min_mb_session)) {
        label = s.remaining_data_mb.toFixed(2) + ' MB';
      } else if (s.type === 'time_or_data') {
        if(parseInt(minutes) >= parseInt(config.flip_game.min_mins_session) || parseInt(s.remaining_data_mb) >= parseInt(config.flip_game.min_mb_session)){
          label = convertCredits(minutes) + ' or ' + s.remaining_data_mb.toFixed(2) + ' MB'
        }
      }

      if(label) {
        session_data.push({
          value: s.id,
          label: label + ' session'
        })
      }
    })

    if(session_data.length < 2 ) {
      document.querySelector('.flip-game-main-containers').style = "pointer-events: none; opacity: 0.5";
      const error_div = document.querySelector('.flip-game-error-div');
      error_div.style.display = 'block'
      error_div.innerHTML = `
        <h4 class="text-danger">You have no available session yet. Make sure you have available session to play the game.</h4>
        <button onclick="closeFlipGame()" class="btn btn-default btn-sm" style="margin-top: 20px">Close</button>
      `
      return;
    } else {
      session_data.forEach(item => {
        const option = document.createElement('option');
        option.setAttribute('value', item.value)
        option.textContent = item.label;
        session_select.appendChild(option)
      });

      session_select.addEventListener('change', function(){
        const start_flip_btn = document.querySelector('.start-flip-btn');
        if(session_select.value){
          flip_game_bet.session = {
            value: session_select.value,
            label: this.options[this.selectedIndex].text
          }
          start_flip_btn.disabled = false
        }else{
          flip_game_bet.session = null
          start_flip_btn.disabled = true
        }
      })
    }
  })
}

function chooseFlipClick(e){
  const targetElement = e.target;
  const is_first_choice = targetElement.classList.contains('first-choice-btn');
  const is_second_choice = targetElement.classList.contains('second-choice-btn');
  const session_select = document.querySelector('.session-select');

  if(is_first_choice)
  {
    const second_choice_btn = document.querySelector('.second-choice-btn')
    second_choice_btn.classList.remove('active')
    targetElement.classList.add('active');
    flip_game_bet.choosen = "first_choice";
    session_select.disabled = false;

  }
  else if(is_second_choice){
    const first_choice_btn = document.querySelector('.first-choice-btn')
    first_choice_btn.classList.remove('active')
    targetElement.classList.add('active');
    flip_game_bet.choosen = "second_choice";
    session_select.disabled = false

  }else {
    session_select.disabled = true
    flip_game_bet.choosen = null
  }
}

function startFlip()
{

  if(!flip_game_bet || !flip_game_bet.choosen || !flip_game_bet.session){
    return alert('You must have choosen bet!');
  }

  flip_game_started = true;
  const start_flip_btn = document.querySelector('.start-flip-btn');
  start_flip_btn.innerText = 'Processing ...'
  document.querySelector('.flip-game-main-containers').style = "pointer-events: none; opacity: 0.5";

  httpGet(sessionsUrl, function(data){
    data = JSON.parse(data)
    const sessions = data.sessions;
    const config = data.config;
    document.querySelector('.front-image').src="/plugins/bonus-plugin/assets/images/flip/first-choice/" + config.flip_game.first_choice_icon;
    document.querySelector('.back-image').src="/plugins/bonus-plugin/assets/images/flip/second-choice/" + config.flip_game.second_choice_icon;
    
    const bet_session = (sessions.filter(s => s.id == flip_game_bet.session.value) || {})[0];
    if(!bet_session || bet_session.status !== 'available'){
      const error_div = document.querySelector('.flip-game-error-div');
      error_div.style.display = 'block'
      error_div.innerHTML = `
        <h4 class="text-danger">Your bet session is not available, please make sure you have available session.</h4>
        <button onclick="closeFlipGame()" class="btn btn-default btn-sm" style="margin-top: 20px">Close</button>
      `
      start_flip_btn.innerText = 'Flip'
      return;
    }
    const chance_of_winning = parseFloat(config.flip_game.chance_of_winning || '30%')/100;
    const random_number = Math.random();
    let final_result;
    let final_result_text;

    if(flip_game_bet.choosen === 'first_choice'){
      const is_true = random_number < chance_of_winning;
      const { result, result_text } = flip_game_animation(is_true, 'first_choice')
      final_result = result
      final_result_text = result_text
    }else if(flip_game_bet.choosen === 'second_choice'){
      const is_true = random_number > (1 - chance_of_winning);
      const { result, result_text } = flip_game_animation(is_true, 'second_choice')
      final_result = result
      final_result_text = result_text
    }
    
    // 4.9 seconds process
    setTimeout( async () => {
      start_flip_btn.innerText = "Flip"
      flip_game_started = false;
      bet_session.label = flip_game_bet.session.label;
      if(flip_game_bet.choosen === final_result){
        winFlipGame(final_result_text, bet_session);
      }else {
        loseFlipGame(final_result_text, bet_session);
      }
      
    }, 4900);
  })

}

function flip_game_animation(is_true, from) {
  let result;
  let result_text;
  const choices_image_container = document.querySelector('.choices-image-container');
  
  if(is_true){
    const _class = from === 'first_choice' ? 'spin-first-choice' : 'spin-second-choice';
    const btn_class = from === 'first_choice' ? '.first-choice-btn' : '.second-choice-btn';
    setTimeout(() => {
      choices_image_container.style.animation =  _class + ' 5s linear forwards';
    }, 100)
    result = from === 'first_choice' ? 'first_choice' : 'second_choice';
    result_text = document.querySelector(`${btn_class}`).innerText;
  }
  else {
    const _class = from === 'first_choice' ? 'spin-second-choice' : 'spin-first-choice';
    const btn_class = from === 'first_choice' ? '.second-choice-btn' : '.first-choice-btn';

    setTimeout(() => {
      choices_image_container.style.animation = _class + ' 5s linear forwards';
    }, 100)
    result = from === 'first_choice' ? 'second_choice' : 'first_choice';
    result_text = document.querySelector(`${btn_class}`).innerText;
  }
  return {
    result,
    result_text: result_text.toUpperCase()
  }
} 

function winFlipGame(result, session)
{
  const prize_log_text = session.label
  const flip_game_win_or_lose_div = document.querySelector('.flip-game-win-or-lose-div')
  
  httpPost(addBonusUrl, {
    bonus_minutes: Math.floor(session.remaining_time_seconds/60),
    bonus_mb: session.remaining_data_mb, 
    prize_log_text, 
    game: 'flip_game'}, function (data) {
      if (data.error) {
        return alert(data.error)
      }

      setTimeout(() => {
        flip_game_win_or_lose_div.style.display = 'block';
        flip_game_win_or_lose_div.innerHTML = `
          <h3 class="text-success mb-2" style="margin-bottom: 5px">Result: ${result}<h3>
          <h3 class="text-success">Congratulations, you won ${session.label}!</h3>
          <br>
          <div class="text-center" style="margin-top: 10px;">
            <button class="btn btn-primary mr-2" onclick="gotToCollect()">Collect</button>
            <button class="btn btn-success" onclick="closeFlipGamePopUp()">Play</button>
          </div>
        `
      }, 500)
    })
}
function loseFlipGame(result, session)
{
  const flip_game_win_or_lose_div = document.querySelector('.flip-game-win-or-lose-div')

  httpPost(removeSessionUrl, {id : session.id }, function(data){
    if (data.error) {
      return alert(data.error)
    }
    setTimeout(() => {
      flip_game_win_or_lose_div.style.display = 'block';
      flip_game_win_or_lose_div.innerHTML = `
        <h3 class="text-danger"  style="margin-bottom: 5px">Result: ${result}<h3>
        <h3 class="text-danger">You lose the ${session.label}</h3>
        <div class="text-center" style="margin-top: 10px">
          <button class="btn btn-success" onclick="closeFlipGamePopUp()">Play</button>
        </div>
      `
    }, 500 )
  })
}

function closeFlipGamePopUp()
{
  document.querySelector('.flip-game-main-containers').style = "pointer-events: ''; opacity: 1";
  document.querySelector('.flip-game-win-or-lose-div').style.display = 'none';
  initFlipGame();
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

        initBonusSettings()
      })
    }
  }, 1e3)
})()
