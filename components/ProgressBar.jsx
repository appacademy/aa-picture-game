var React = require('react');

var ProgressBar = React.createClass({
  render: function () {
    var scores = this.props.scores
    return (
      <figure className="progress-bar">
        {
          Object.keys(scores).map(key => {
            var className = `progress-square score-${scores[key]}`
            return <div className={className} key={key}></div>
          })
        }
      </figure>
    )
  }
});

module.exports = ProgressBar;
