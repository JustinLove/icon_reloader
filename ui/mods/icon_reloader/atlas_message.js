;(function() {
  var findN = /\d+$/
  var byId = function(a, b) {
    var an = parseInt(a.match(findN), 10)
    var bn = parseInt(b.match(findN), 10)
    if (an < bn) return -1
    else if (bn < an) return 1
    else return 0
  }

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
    //console.log('check', prefix)
    api.memory.list(prefix).then(function(boxes) {
      boxes = _.difference(boxes, ack)
      if (boxes.length < 1) return
      ack = ack.concat(boxes)
      boxes.sort(byId).forEach(function(boxName) {
        api.memory.load(boxName).then(function(value) {
          var item = decode(value) || []
          console.log('receive', boxName, item)
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

