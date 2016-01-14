var React = require('react');

var Message = React.createClass({
  render: function () {
    var message;

    switch (this.props.status) {
      case "guessing":
        message = "Who do you think this is?";
        break;
      case "incorrect":
        message = "Incorrect, it was " + this.props.currentName;
        break;
      case "close":
        message = "Close, it was " + this.props.currentName;
        break;
      case "correct":
        message = "Correct, it was " + this.props.currentName;
        break;
    }

    var classNames = "message-display " + this.props.status;

    return (
      <div>
        <p className={classNames}>
         {message}
        </p>
      </div>
    );
  }
});

module.exports = Message;
