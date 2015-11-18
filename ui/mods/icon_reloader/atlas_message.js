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

  var mailboxes = {}
  var Mailbox = function(pageid) {
    if (mailboxes[pageid]) return mailboxes[pageid]

    this.pageid = pageid
    this.messages = []
    this.pending = 0
    mailboxes[pageid] = this
    return this
  }

  Mailbox.prototype.flush = function() {
    while (this.messages.length > 0) {
      this.pending++
      this.ws.send(this.messages.shift())
    }
  }
  Mailbox.prototype.send = function(method, params) {
    this.messages.push(JSON.stringify({
      id: 0,
      method: method,
      params: params
    }))
    if (this.ws && this.ws.readystate == 1) {
      this.flush()
    }
  }
  Mailbox.prototype.receive = function(message) {
    if (message && message.data) {
      //console.log('data', JSON.parse(message.data).result)
    } else {
      //console.log('message', message)
    }
    this.pending--
    if (this.pending < 1 && this.messages.length < 1) {
      this.close()
    }
  }
  Mailbox.prototype.close = function() {
    this.ws.close()
    this.ws = null
  }

  var debugMessage = function(page, method, params) {
    if (!page) return

    var mb = new Mailbox(page.id)
    mb.send(method, params)

    if (mb.ws) return

    ws = mb.ws = new WebSocket('ws://127.0.0.1:9999/devtools/page/' + page.id);
    ws.onmessage = function(message) {
      //console.log('message')
      mb.receive(message)
    }
    ws.onerror = function(error) {
      console.error('error', error);
      mb.close()
    }
    ws.onopen = function() {
      //console.log('open')
      mb.flush()
    }
    ws.onclose = function() {
      //console.log('close')
      mb.ws = null
    }
  }
  var close = function() {
    mailboxes.forEach(function(mb) {
      if (mb.ws) {
        mb.ws.close()
        mb.ws = null
      }
    })
  }

  window.atlasMessage = window.atlasMessage || {}
  atlasMessage.load = load
  atlasMessage.message = message
  atlasMessage.close = close
})()
