;(function() {
  var message = function(mailbox, message, payload) {
    var boxName = 'mailbox:'+mailbox
    api.memory.load(boxName).then(function(value) {
      var mb = decode(value) || []
      mb.push({message: message, payload: payload})
      api.memory.store(boxName, encode(mb))
    })
  }
  var check = function(mailbox) {
    var boxName = 'mailbox:'+mailbox
    api.memory.load(boxName).then(function(value) {
      var mb = decode(value) || []
      mb.forEach(function(item) {
        if (handlers[item.message]) {
          handlers[item.message](item.payload)
        }
      })
      api.memory.store(boxName, encode([]))
    })
  }
  var poll = function(mailbox, timeout) {
    check(mailbox)
    setTimeout(poll, timeout, mailbox, timeout)
  }

  window.atlasMessage = window.atlasMessage || {}
  atlasMessage.message = message
  atlasMessage.check = check
  atlasMessage.poll = poll

  // prior version stubs
  atlasMessage.load = function() {}
  atlasMessage.close = function() {}
})()

