(function() {
  console.log('loaded icon atlas')

  model.iconPool = model.iconPool || []

  var tryToAssignString = function(to) {
    model.strategicIcons.push(to)
  }

  var tryToAssignObject = function(obj) {
    var to = Object.keys(obj)[0]
    tryToAssignString(to)
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

  handlers.release_icons = function(icons) {}

  handlers.update_and_freeze_icon_changes = function() {
    model.sendIconList()
  }

  handlers.reload_icons = function() {
    console.log('reload icons')
    $('img').attr('src', function(i, v) {
      return v.split('?')[0] + '?' + Date.now().toString()
    })
  }

  model.strategicIcons.subscribe(model.sendIconList)

  handlers.reload_icons()
  atlasMessage.poll('icon_atlas', 100)
})()
