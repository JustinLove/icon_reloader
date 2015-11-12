(function() {
  console.log('loaded icon atlas')

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
        handlers.reload_icons()
      }
    }

    $.get('http://127.0.0.1:9999/json').then(findPage)
  }

  handlers.reload_icons()
  pollLiveGame()
})()
