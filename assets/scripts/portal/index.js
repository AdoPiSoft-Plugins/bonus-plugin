const getAllBonusUrl = '/bonus-plugin/portal/all'
const collectUrl = '/bonus-plugin/portal/collect'

var fetchedData = []

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
  document.querySelector('.bonus-main-icon').style = 'display: block'
  document.querySelector('.bonus-container').style = 'display: none'
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
    closeBonus()
  })
}

function setChallenges (challenges_div) {
  let challenges = []
  challenges_div.innerHTML = ''
  const config = fetchedData.config

  if (config.bonus_type === 'certain_amount') {
    const text = `If you reach the amount ${config.bonus_amount_needed} pesos within ${(config.bonus_limit_days).replace('_', ' ')},
    you'll get free ${config.bonus_mb ? config.bonus_mb + ' MB' : convertCredits(config.bonus_minutes)} bonus session.`
    challenges.push(text)
  }

  for (const item of challenges) {
    const index = challenges.indexOf(item) + 1
    const p = document.createElement('p')
    p.className = 'p_element'
    p.innerText = index + '. ' + item
    challenges_div.append(p)
  }
}

function tabClick (i) {
  const challenges_div = document.querySelector('.challenges-div')
  const rewards_div = document.querySelector('.rewards-div')
  const rewards_a = document.querySelector('.rewards')
  const challenges_a = document.querySelector('.challenges')

  if (i === 1) {
    rewards_div.style.display = 'block'
    challenges_div.style.display = 'none'
    rewards_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
    challenges_a.style = 'font-weight: normal; border-bottom: none'
  } else if (i === 2) {
    rewards_div.style.display = 'none'
    challenges_div.style.display = 'block'
    challenges_a.style = 'font-weight: bold; border-bottom: 3px solid #920092;'
    rewards_a.style = 'font-weight: normal; border-bottom: none'
    setChallenges(challenges_div)
  }
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
      })
    }
  }, 1e3)
})()
