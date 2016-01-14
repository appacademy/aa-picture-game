var React = require('react');

var Picture = React.createClass({
  render: function () {
    return (
      <div>
        <img src={this.props.src}/>
      </div>
    );
  }
});

module.exports = Picture;
