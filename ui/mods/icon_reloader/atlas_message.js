;(function() {
  var lookupPage = function(pageName) {
    var def = $.Deferred()
    var findPage = function(pages) {
      //console.log(pages)
      var page = pages.filter(function(page) {
        return page.url.match('/'+pageName+'.html')
      })[0]
      def.resolve(page)
    }

    $.get('http://127.0.0.1:9999/json').then(findPage)

    return def.promise()
  }

  var load = function(pageName, script) {
    lookupPage(pageName).then(function(page) {
      //console.log(page)
      loadScriptOnPage(page, script)
    })
  }

  var loadScriptOnPage = function(page, script) {
    evaluateOnPage(page, loadScript(script))
  }

  var loadScript = function(script) {
    return 'loadScript("' + script + '")'
  }

  var message = function(pageName, message, payload) {
    lookupPage(pageName).then(function(page) {
      //console.log(page)
      messagePage(page, message, payload)
    })
  }

  var messagePage = function(page, message, payload) {
    evaluateOnPage(page, invokeHandler(message, payload))
  }

  var invokeHandler = function(message, payload) {
    var args = ''
    if (payload) {
      args = JSON.stringify(payload)
    }
    return 'handlers["' + message + '"](' + args + ')'
  }

  var evaluateOnPage = function(page, expression) {
    debugMessage(page, 'Runtime.evaluate', {expression: expression})
  }

  var ws
  var debugMessage = function(page, method, params) {
    if (!page) return

    ws = new WebSocket('ws://127.0.0.1:9999/devtools/page/' + page.id);
    ws.onmessage = function(message) {
      //console.log('message')
      if (message && message.data) {
        //console.log('data', JSON.parse(message.data).result)
      } else {
        //console.log('message', message)
      }
      ws.close()
      ws = null
    }
    ws.onerror = function(error) {
      console.error('error', error);
      ws.close()
      ws = null
    }
    ws.onopen = function() {
      //console.log('open')

      ws.send(JSON.stringify({
        id: 0,
        method: method,
        params: params
      }))
    }
    ws.onclose = function() {
      //console.log('close')
      ws = null
    }
  }
  var close = function() {
    if (ws) {
      ws.close()
    }
  }

  window.atlasMessage = window.atlasMessage || {}
  atlasMessage.load = load
  atlasMessage.message = message
  atlasMessage.close = close
})()
