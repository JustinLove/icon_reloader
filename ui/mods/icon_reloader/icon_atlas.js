(function() {
  console.log('loaded icon atlas')

  var testNoFreeSlots = false

  if (!model.stockStrategicIcons) {
    console.log('capture stock strategic icons')
    model.stockStrategicIcons = model.strategicIcons().slice(0)
  }

  model.iconPool = model.iconPool || []

  // two entries, second is used by game
  var duplicateCommander = model.stockStrategicIcons.filter(function(icon) {
    return icon == 'commander'
  }).length > 1
  if (duplicateCommander) {
    model.iconPool.push('commander')
  }
  model.iconPool = model.iconPool.concat([
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
    model.slotUsage = model.strategicIcons().map(function(id) {
      return [id]
    })
    if (!testNoFreeSlots) {
      model.iconPool.forEach(function(id) {
        var i = model.strategicIcons().indexOf(id)
        //console.log('unused?', id, i)
        if (i > -1) {
          model.slotUsage[i] = []
        }
      })
    }
  }

  var assignedIndex = function(id) {
    for (var index = 0;index < model.slotUsage.length;index++) {
      var i = model.slotUsage[index].indexOf(id)
      if (i > -1) return index
    }

    return -1
  }

  var emptySlot = function() {
    for (var i = 0;i < model.slotUsage.length;i++) {
      if (model.slotUsage[i].length < 1) return i
    }

    return -1
  }

  var assign = function(to, i) {
    var from = model.strategicIcons()[i]
    console.log('replacing', from, to)
    model.strategicIcons()[i] = to
    model.slotUsage[i].push(to)
  }

  var alias = function(to, i) {
    var from = model.strategicIcons()[i]
    console.log('alias', from, to)
    model.slotUsage[i].push(to)
  }

  var release = function(to) {
    model.slotUsage.forEach(function(slot) {
      var i = slot.indexOf(to)
      if (i > -1) {
        slot.splice(i, 1)
      }
    })
  }

  var tryToAssignString = function(to) {
    var a = assignedIndex(to)
    if (a > -1) return a

    var e = emptySlot()
    if (e > -1) {
      assign(to, e)
      return e
    }

    return -1
  }

  var tryToAssignAlias = function(to, aliases) {
    for (var i in aliases) {
      var a = assignedIndex(aliases[i])
      if (a > -1) {
        alias(to, a)
        return a
      }
    }

    return -1
  }

  var tryToAssignObject = function(obj) {
    var to = Object.keys(obj)[0]
    var s = tryToAssignString(to)
    if (s > -1) return s

    return tryToAssignAlias(to, obj[to])
  }

  handlers.request_icons = function(icons) {
    _.uniq(icons).forEach(function(to) {
      if (typeof(to) == 'string') {
        tryToAssignString(to)
      } else {
        tryToAssignObject(to)
      }
    })

    model.strategicIcons.notifySubscribers()
  }

  handlers.release_icons = function(icons) {
    if (!testNoFreeSlots) {
      _.uniq(icons).forEach(release)
    }
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

  var sendIconListLater = function() {
    if (model.pendingIconList) {
      clearTimeout(model.pendingIconList)
    }
    model.pendingIconList = setTimeout(function() {
      model.pendingIconList = null

      var unready = 0
      $('img').each(function() {
        if (!this.complete) unready++
      })

      if (unready > 0) {
        console.log(unready, 'unready')
        sendIconListLater()
        return
      }

      sendLayered()
    }, 5000)
  }

  var sendLayered = function() {
    var list = model.strategicIcons();

    var layers = Math.max.apply(Math, model.slotUsage.map(function(slot) {
      return slot.length
    }))

    console.log('sending icons, no more changes will be reflected. layers:', layers)
    for (var l = layers-1;l >= 0;l--) {
      model.slotUsage.forEach(function(slot, i) {
        if (slot[l]) {
          list[i] = slot[l]
        }
      })
      //console.log(l, list.slice(0))
      engine.call('handle_icon_list', list, 52);
    }
  }

  // reset timer to ensure page has time to load and repaint
  var deferIconList = function() {
    if (model.pendingIconList) {
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
