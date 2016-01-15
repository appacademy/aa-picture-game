var React = require('react');

var ProgressBar = React.createClass({
  render: function () {
    return (
      <div className="progress-bar">
        {
          this.props.bucketSizes.map((bucketSize, idx) => {
            var bucketSquares = [];
            var status;
            for(var i = 0; i < bucketSize; i ++) {
              switch (idx) {
                case 0:
                  status = "incorrect";
                  break;
                case 1:
                  status = "close";
                  break;
                case 2:
                  status = "correct";
                  break;
              }
              bucketSquares.push(
                <div className={`bucket-square ${status}`} key={i}>
                </div>
                );
            }
            return (
              <div className="bucket-size-container" key={bucketSize^(idx + 1)}>
                {bucketSquares}
              </div>
             );
          })
        }
      </div>
    )
  }
});

module.exports = ProgressBar;
