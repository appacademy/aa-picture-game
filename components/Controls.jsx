var React = require('react');
var NextItemButton = require('./NextItemButton');
var GuessInput = require('./GuessInput');

var Controls = React.createClass({
  render: function () {
    if (this.props.status === "guessing") {
      var control = <GuessInput />;
    } else {
      control = <NextItemButton />;
    }
    return (
      <div>
        {control}
      </div>
    );
  }
});

module.exports = Controls;
