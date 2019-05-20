
var React = require('react');
var NextItemButton = require('./NextItemButton');
var GuessInput = require('./GuessInput');

const GUESS_TYPES = ['Full Name', 'First Name'];

var Controls = React.createClass({
  getInitialState: function () {
    return {guessTypeIndex: 0};
  },

  toggleGuessType: function(e) {
    e.preventDefault();
    this.setState({ guessTypeIndex: (this.state.guessTypeIndex + 1) % 2});
  },

  render: function () {
    const guessType = GUESS_TYPES[this.state.guessTypeIndex];
    let control;
    if (this.props.status === "guessing") {
      control = <GuessInput guessType={guessType} />;
    } else {
      control = <NextItemButton/>;
    }

    return (
      <div>
        <div className="guess-block">
          <div onClick={this.toggleGuessType} className="game-type">
            <p className="guess-type-txt">guess type: {guessType}</p>
          </div>

          {control}
        </div>
      </div>
    );
  }
});

module.exports = Controls;
