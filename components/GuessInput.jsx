var React = require('react');
var LinkedStateMixin = require('react-addons-linked-state-mixin');
var guessActions = require('../actions/guessActions');

var GuessInput = React.createClass({
  mixins: [LinkedStateMixin],
  getInitialState: function () {
    return {guess: ''};
  },
  checkGuess: function (e) {
    e.preventDefault();
    guessActions.addGuess(this.state.guess);
    this.setState({ guess: '' });
  },

  render: function () {
    return (
      <form className="user-input" onSubmit={this.checkGuess}>
        <input type="text"
          className="answer"
          valueLink={this.linkState('guess')}
          ref={input => {
            if (input != null) {
              input.focus();
            }
          }}/>
      </form>
    );
  }
});

module.exports = GuessInput;
