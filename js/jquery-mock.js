/**
 * Node.js環境でjQueryっぽい動きをするモックです
 */
var $mock = function(arg) {
  typeof arg ==='function' && arg()
  return $mock
}

/**
 * ファイルアクセスを行います
 */
$mock.get = function(filename, callback) {
  var fs = require('fs')
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
$mock.change = function() {}
$mock.click = function() {}
$mock.show = function() {}
$mock.addClass = function() {}
$mock.css = function() {}
$mock.html = function() {}

module.exports = $mock
