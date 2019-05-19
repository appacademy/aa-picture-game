var React = require('react');
var guessActions = require('../actions/guessActions');

var ProgressBar = React.createClass({
  onClick: function(key) {
    guessActions.setItem(key);
  },

  resetScores: function(e) {
    e.preventDefault();
    guessActions.resetGameState();
  },

  render: function () {
    var scores = this.props.scores;
    return (
      <figure className="progress-bar clearfix">
        <div className="container">
          {
            Object.keys(scores).map(key => {
              var className = `progress-square score-${scores[key]}`;
              return (<div className={className} key={key}
                           onClick={this.onClick.bind(this, key)}>
                <img src={this.props.people[key].imageUrl}></img>
              </div>);
            })
          }
        </div>
        <span onClick={this.resetScores}
          className="reset-button">Reset Scores</span>
      </figure>
    );
  }
});

module.exports = ProgressBar;
