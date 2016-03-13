var React = require('react');
var people = require('../data/people')

var ProgressBar = React.createClass({
  render: function () {
    var scores = this.props.scores
    return (
      <figure className="progress-bar clearfix">
        <div className="container">
          {
            Object.keys(scores).map(key => {
              var className = `progress-square score-${scores[key]}`
              return (<div className={className} key={key}>
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
