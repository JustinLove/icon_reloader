(function() {
  console.log('loaded icon atlas')

  if (!model.stockStrategicIcons) {
    console.log('capture stock strategic icons')
    model.stockStrategicIcons = model.strategicIcons().slice(0)
  }

  model.iconPool = [
    'commander', // two entries, second is used
    'energy_storage_adv',
    'metal_storage_adv',
    'tank_lava',
    'paratrooper',
    'tutorial_titan_commander',
    'metal_spot_preview',
    'avatar',
    'deep_space_radar',
  ]

  model.resetCustomIcons = function() {
    model.strategicIcons(model.stockStrategicIcons.slice(0))
    model.unusedIcons = model.iconPool.slice(0)
    handlers.reload_icons()
  }

  handlers.request_icons = function(icons) {
    while (icons.length > 0 && model.unusedIcons.length > 0) {
      var to = icons.shift()
      if (model.strategicIcons().indexOf(to) != -1) {
        continue
      }
      var from = model.unusedIcons.shift()
      console.log('replacing', from, to)
      var i = model.strategicIcons().indexOf(from)
      model.strategicIcons()[i] = to
    }

    model.strategicIcons.notifySubscribers()
  }

  handlers.replace_icons = function(map) {
    model.strategicIcons(model.strategicIcons().map(function(icon) {
      var newIcon = map[icon]
      if (newIcon) {
        delete map[icon]
        return newIcon
      } else {
        return icon
      }
    }))
  }

  handlers.update_and_freeze_icon_changes = function() {
    model.sendIconList()
  }

  handlers.reload_icons = function() {
    console.log('reload icons')
    $('img').attr('src', function(i, v) {
      return v.split('?')[0] + '?' + Date.now().toString()
    })
  }

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
        setTimeout(model.sendIconList, 1000)
      }
    }

    $.get('http://127.0.0.1:9999/json').then(findPage)
  }

  model.resetCustomIcons()
  handlers.reload_icons()
  pollLiveGame()
})()
