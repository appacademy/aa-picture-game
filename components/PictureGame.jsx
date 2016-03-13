var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var ProgressBar = require('./ProgressBar');
var GameStateStore = require('../stores/gameState');
var FuzzySet = require('../util/fuzzyset');
window.GameStateStore = GameStateStore;

var PictureGame = React.createClass({
  getInitialState: function () {
    return {
      status: "guessing",
      nextPicture: false,
      person: GameStateStore.currentItem(),
      scores: GameStateStore.getScores()
    };
  },
  componentDidMount : function () {
    GameStateStore.addListener(this.updateItem);
  },
  updateItem: function () {
    this.setState({
      person: GameStateStore.currentItem(),
      status: GameStateStore.status(),
      nextPicture: false,
      scores: GameStateStore.getScores()
    });
  },
  currentName: function () {
    return this.state.person.name + " (" + GameStateStore.currentItem().occup + ")";
  },
  render: function () {
    return (
      <div>
        <header>
          <div className="frame">
            <img src="logo.png" alt="App Academy Logo" className="logo visible" />
          </div>
          <h1>The Picture Game</h1>
        </header>
        <div className="clearfix centered">
          <section className="game-zone">
            <Picture src={this.state.person.imageUrl} />
            <Message status={this.state.status}
              currentName={this.currentName()}
              currentOcup={GameStateStore.currentItem().occup}/>
            <Controls
              status={this.state.status}
              nextPicture={this.nextPicture}/>
          </section>
          <ProgressBar scores={this.state.scores}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;
