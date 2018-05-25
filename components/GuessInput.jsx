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
    if(this.props.guessType === "First Name") {
      if(this.state.guess.split(" ").length > 1) {
        this.setState({errors: "First name only"});
        return;
      }
    }
    guessActions.addGuess(this.props.guessType, this.state.guess, this.props.city);
    this.setState({ guess: '' });
  },

  clearErrors: function() {
    this.setState({ errors: false });
  },

  componentWillReceiveProps: function() {
    this.clearErrors();
  },

  render: function () {
    let errors;
    if(this.state.errors && this.props.guessType === "First Name") {
      errors = <p className="first-name-error">{this.state.errors}</p>;
    }

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

          { errors }
      </form>
    );
  }
});

module.exports = GuessInput;
