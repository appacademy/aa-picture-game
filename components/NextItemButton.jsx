var React = require('react');
var guessActions = require('../actions/guessActions');

var NextItemButton = React.createClass({
  advance: function () {
    guessActions.nextItem(this.props.city);
  },
  render: function () {
    return (
        <button className="next"
          onClick={this.advance}
          ref={button => {
            if (button != null) {
              button.focus();
            }
          }}>Next</button>
      );
  }
});

module.exports = NextItemButton;
