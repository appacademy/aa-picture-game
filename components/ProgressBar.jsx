var React = require('react');
var guessActions = require('../actions/guessActions');
var people = require('../data/people');

var ProgressBar = React.createClass({
  onClick: function(key) {
    guessActions.setItem(key);
  },
  render: function () {
    var scores = this.props.scores
    return (
      <figure className="progress-bar clearfix">
        <div className="container">
          {
            Object.keys(scores).map(key => {
              var className = `progress-square score-${scores[key]}`
              return (<div className={className} key={key}
                           onClick={this.onClick.bind(this, key)}>
                <img src={people[key].imageUrl}></img>
              </div>)
            })
          }
        </div>
      </figure>
    )
  }
});

module.exports = ProgressBar;
