;(function() {
  var id = 0
  var ack = []
  var message = function(mailbox, message, payload) {
    //console.log('send', arguments)
    var boxName = 'mailbox:'+mailbox+':'+(id++).toString()
    var item = {message: message, payload: payload}
    api.memory.store(boxName, encode(item))
  }
  var check = function(mailbox) {
    var prefix = 'mailbox:'+mailbox+':'
    api.memory.list(prefix).then(function(boxes) {
      boxes = _.difference(boxes, ack)
      if (boxes.length < 1) return
      ack = ack.concat(boxes)
      boxes.forEach(function(boxName) {
        api.memory.load(boxName).then(function(value) {
          var item = decode(value) || []
          //console.log('receive', boxName, item)
          if (handlers[item.message]) {
            handlers[item.message](item.payload)
          }
          api.memory.clear(boxName).then(function() {
            ack = _.without(ack, boxName)
          })
        })
      })
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

