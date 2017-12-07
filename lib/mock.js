/**
 * Node.js環境でjQueryっぽい動きをするモックです
 */
const jquery = function(arg) {
  typeof arg ==='function' && arg()
  return jquery
}

/**
 * ファイルアクセスを行います
 */
jquery.get = function(filename, callback) {
  const fs = require('fs')
  fs.readFile(filename, function(err, data) {
    if (err) {
      console.err(err)
    }
    callback(data.toString('utf-8'))
  })
}

/**
 * 空です
 */
const noop = x => x
jquery.change = noop
jquery.click = noop
jquery.show = noop
jquery.addClass = noop
jquery.css = noop
jquery.html = noop
const localStorage = {
  setItem: noop,
  getItem: noop
}
const navigator = {}

module.exports = {
  jquery,
  localStorage,
  navigator,
}
