var React = require('react');
var ReactDOM = require('react-dom');
var PictureGame = require('./components/PictureGame');

document.addEventListener('DOMContentLoaded', function () {
  var root = document.querySelector('#root');
  ReactDOM.render(<PictureGame />, root);
});
