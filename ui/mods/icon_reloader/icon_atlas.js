(function() {
  console.log('loaded icon atlas')

  if (!model.stockStrategicIcons) {
    console.log('capture stock strategic icons')
    model.stockStrategicIcons = model.strategicIcons().slice(0)
  }

  model.iconPool = model.iconPool || []
  model.iconPool = model.iconPool.concat([
    'commander', // two entries, second is used by game
    'energy_storage_adv',
    'metal_storage_adv',
    'tank_lava',
    'paratrooper',
    'tutorial_titan_commander',
    'metal_spot_preview',
    'avatar',
    //'deep_space_radar', // see our live_game.js
  ])

  model.resetCustomIcons = function() {
    model.strategicIcons(model.stockStrategicIcons.slice(0))
    model.unusedIcons = model.iconPool.slice(0)
  }

  handlers.request_icons = function(icons) {
    // requested something from our pool
    model.unusedIcons = _.difference(model.unusedIcons, icons)
    // already there
    icons = _.difference(icons, model.strategicIcons())

    while (icons.length > 0 && model.unusedIcons.length > 0) {
      var to = icons.shift()
      var from = model.unusedIcons.shift()
      console.log('replacing', from, to)
      var i = model.strategicIcons().indexOf(from)
      model.strategicIcons()[i] = to
    }

    model.strategicIcons.notifySubscribers()
  }

  handlers.release_icons = function(icons) {
    // can't release things aren't in use
    icons = _.intersection(icons, model.strategicIcons())

    model.unusedIcons = _.union(model.unusedIcons, icons)
  }

  handlers.update_and_freeze_icon_changes = function() {
    sendIconListLater()
  }

  handlers.reload_icons = function() {
    console.log('reload icons')
    $('img').attr('src', function(i, v) {
      return v.split('?')[0] + '?' + Date.now().toString()
    })
    deferIconList()
  }

  var pendingIconList
  var sendIconListLater = function() {
    if (pendingIconList) {
      clearTimeout(pendingIconList)
    }
    pendingIconList = setTimeout(function() {
      pendingIconList = null
      console.log('sending icons, no more changes will be reflected')
      model.sendIconList()
    }, 2000)
  }

  // reset timer to ensure page has time to load and repaint
  var deferIconList = function() {
    if (pendingIconList) {
      sendIconListLater()
    }
  }

  model.strategicIcons.subscribe(deferIconList)

  var pollLiveGame = function() {
    var findPage = function(pages) {
      //console.log(pages)
      var page = pages.filter(function(page) {
        return page.url == "coui://ui/main/game/live_game/live_game.html"
      })[0]
      if (!!page) {
        setTimeout(pollLiveGame, 5000)
      } else {
        model.resetCustomIcons()
        handlers.reload_icons()
        sendIconListLater()
      }
    }

    $.get('http://127.0.0.1:9999/json').then(findPage)
  }

  model.resetCustomIcons()
  handlers.reload_icons()
  pollLiveGame()
})()
