(function() {
  console.log('loaded icon atlas')

  model.iconPool = model.iconPool || []
  model.strategicIcons(_.uniq(model.strategicIcons()))

  handlers.request_icons = function(icons) {
    var additions = []
    _.uniq(icons).forEach(function(to) {
      if (typeof(to) == 'string') {
        additions.push(to)
      } else {
        additions.push(Object.keys(to)[0])
      }
    })

    model.strategicIcons(_.union(model.strategicIcons(), additions))
  }

  handlers.release_icons = function(icons) {}

  handlers.update_and_freeze_icon_changes = function() {
    setTimeout(model.sendIconList, 5000)
  }

  handlers.reload_icons = function() {
    api.file.mountMemoryFiles({})
  }

  model.strategicIcons.subscribe(model.sendIconList)

  atlasMessage.poll('icon_atlas', 100)
})()
