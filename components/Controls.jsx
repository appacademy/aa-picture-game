var React = require('react');
var NextItemButton = require('./NextItemButton');
var GuessInput = require('./GuessInput');

var Controls = React.createClass({
  getInitialState: function () {
    return {gameType: 'Full Name', selectors: false};
  },

  handleSelectors: function(e) {
    e.preventDefault();
    if(this.state.selectors) {
      this.setState({ selectors: false });
    } else {
      this.setState({ selectors: true });
    }
  },

  handleFull: function(e) {
    e.preventDefault();
    this.setState({ gameType: "Full Name" });
    this.setState({ selectors: false });
  },

  handleFirst: function(e) {
    e.preventDefault();
    this.setState({ gameType: "First Name" });
    this.setState({ selectors: false });
  },

  createSelectors: function() {
    let type;
    if(this.state.gameType === "Full Name") {
      type = <div><div className="game-type-selector" onClick={this.handleFirst} value="First-Name">First Name</div></div>;
    } else if(this.state.gameType === "First Name") {
      type = <div><div className="game-type-selector" onClick={this.handleFull} value="Full-Name">Full Name</div></div>;
    }
    return type;
  },

  render: function () {
    // let selectors = (
    //   <div>
    //     <div className="game-type-selector"
    //       onClick={this.handleFirst} value="First-Name">First Name</div>
    //     <div className="game-type-selector"
    //       onClick={this.handleFull} value="Full-Name">Full Name</div>
    //   </div>
    //   );

    let selectors = this.createSelectors();

    if (this.props.status === "guessing") {
      var control = <GuessInput guessType={this.state.gameType} />;
    } else {
      control = <NextItemButton />;
    }
    return (
      <div>
        <div onClick={this.handleSelectors}
          className="game-type">Guess Type: {this.state.gameType}</div>

        {this.state.selectors ? selectors : null }

        {control}
      </div>
    );
  }
});

module.exports = Controls;
