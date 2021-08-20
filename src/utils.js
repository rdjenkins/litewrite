var $ = require('jquery')
var _ = require('underscore')
var translations = require('./translations')

var utils = {}

utils.isMac = /Mac/.test(navigator.platform)

function setModes () {
  // Keep in sync with value in litewrite.css
  utils.isMobile = window.matchMedia('(max-width:1024px)').matches
  utils.isDesktop = !utils.isMobile
}

$(window).on('resize', setModes)
setModes()

// For more info:
// http://stackoverflow.com/questions/3561493/is-there-a-regexp-escape-function-in-javascript/3561711#3561711
utils.escapeRegExp = function (str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// in seconds
var hour = 3600
var day = 24 * hour
var week = 7 * day
var month = 30.4 * day
var year = 365 * day

var quantifiers = [
  {
    name: 'yearsAgo',
    time: year
  },
  {
    name: 'monthsAgo',
    time: month
  },
  {
    name: 'weeksAgo',
    time: week
  },
  {
    name: 'daysAgo',
    time: day
  },
  {
    name: 'hoursAgo',
    time: hour
  },
  {
    name: 'minutesAgo',
    time: 60
  },
  {
    name: 'secondsAgo',
    time: 1
  }
]

utils.timeAgo = function (date) {
  var diff = (Date.now() - date) / 1000 // in seconds

  var quantifier = _.find(quantifiers, function (q) {
    return diff >= q.time
  })

  if (!quantifier) {
    return
  }

  var count = Math.round(diff / quantifier.time)
  return translations[quantifier.name](count)
}

utils.handleAppcacheUpdates = function () {
  var appcache = window.applicationCache
  if (!appcache) {
    return
  }

  appcache.addEventListener('updateready', function (e) {
    if (appcache.status !== appcache.UPDATEREADY) return
    if (!window.confirm(translations.updateCache)) return
    window.location.reload()
  }, false)
}

utils.hotKey = utils.isMac ? 'Alt' : 'Ctrl'

utils.Downloader = Backbone.View.extend({
  el: '#download',

  initialize: function () {
    _.bindAll(this, 'render', 'download')
    this.$el.text(translations.saveasfile)
    this.render()
  },

  render: function () {
    this.$el.toggleClass('hide')
  },

  events: {
    click: 'download'
  },

  download: function () {
    // proof of concept download to file
    var text = this.model.get('content')
    var id = this.model.get('id')
    text = text.replace(/\n/g, '\r\n') // To retain the Line breaks.
    var blob = new Blob([text], { type: 'text/plain' })
    var anchor = document.createElement('a')
    anchor.download = id + '-litewrite.txt'
    anchor.href = window.URL.createObjectURL(blob)
    anchor.target = '_blank'
    anchor.style.display = 'none' // just to be safe!
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    this.trigger('download')
  }
})

module.exports = utils
