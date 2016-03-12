var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var ProgressBar = require('./ProgressBar');
var GameStateStore = require('../stores/gameState');
var FuzzySet = require('../util/fuzzyset');

var PictureGame = React.createClass({
  getInitialState: function () {
    return {
      status: "guessing",
      nextPicture: false,
      person: GameStateStore.currentItem(),
      bucketSizes: GameStateStore.bucketSizes()
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
      bucketSizes: GameStateStore.bucketSizes()
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
        <ProgressBar bucketSizes={this.state.bucketSizes}/>

        <div className="game-zone">
          <Picture src={this.state.person.imageUrl} />
          <Message status={this.state.status}
            currentName={this.currentName()}
            currentOcup={GameStateStore.currentItem().occup}/>
          <Controls
            status={this.state.status}
            nextPicture={this.nextPicture}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;
