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
    evaluateOnPage(pageName, loadScript(script))
  }

  var loadScript = function(script) {
    return 'loadScript("' + script + '")'
  }

  var message = function(pageName, message, payload) {
    evaluateOnPage(pageName, invokeHandler(message, payload))
  }

  var invokeHandler = function(message, payload) {
    var args = ''
    if (payload) {
      args = JSON.stringify(payload)
    }
    return 'handlers["' + message + '"](' + args + ')'
  }

  var evaluateOnPage = function(pageName, expression) {
    debugMessage(pageName, 'Runtime.evaluate', {expression: expression})
  }

  var mailboxes = {}
  var Mailbox = function(pageName) {
    if (mailboxes[pageName]) return mailboxes[pageName]

    this.pageName = pageName
    this.messages = []
    this.pending = 0
    this.lookupPending = false
    mailboxes[pageName] = this
    return this
  }

  Mailbox.prototype.flush = function() {
    //console.log('flush')
    while (this.messages.length > 0) {
      this.pending++
      var message = this.messages.shift()
      //console.log('sending', message)
      this.ws.send(message)
    }
  }
  Mailbox.prototype.send = function(method, params) {
    //console.log('mb send', method,params)
    this.messages.push(JSON.stringify({
      id: 0,
      method: method,
      params: params
    }))
    if (this.ws) {
      if (this.ws.readyState == 1) {
        this.flush()
      }
    } else if (!this.lookupPending) {
      this.connect()
    }
  }
  Mailbox.prototype.receive = function(message) {
    if (message && message.data) {
      var data = JSON.parse(message.data)
      if (data.wasThrown) {
        //console.log('data:error', data.result.description)
      } else {
        //console.log('data', data.result.result)
      }
    } else {
      //console.log('message', message)
    }
    this.pending--
    if (this.pending < 1 && this.messages.length < 1) {
      this.close()
    }
  }
  Mailbox.prototype.connect = function() {
    var mb = this
    //console.log('connect', mb.ws, mb.lookupPending)
    if (mb.ws || mb.lookupPending) return

    mb.lookupPending = true
    lookupPage(this.pageName).then(function(page) {
      mb.lookupPending = false
      mb.openSocket(page)
    })
  }
  Mailbox.prototype.openSocket = function(page) {
    if (!page) return

    var mb = this
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
  Mailbox.prototype.close = function() {
    this.ws.close()
    this.ws = null
  }

  var debugMessage = function(pageName, method, params) {
    if (!pageName) return

    var mb = new Mailbox(pageName)
    mb.send(method, params)
  }
  var close = function() {
    mailboxes.forEach(function(mb) {
      if (mb.ws) {
        mb.close()
      }
    })
  }

  window.atlasMessage = window.atlasMessage || {}
  atlasMessage.load = load
  atlasMessage.message = message
  atlasMessage.close = close
})()
