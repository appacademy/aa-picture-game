var React = require('react');

var Picture = React.createClass({
  render: function () {
    return (
      <img src={this.props.src}/>
    );
  }
});

module.exports = Picture;
