var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var ProgressBar = require('./ProgressBar');
var GameDataStore = require('../stores/gameData');
var FuzzySet = require('../util/fuzzyset');

var PictureGame = React.createClass({
  getInitialState: function () {
    return {
      status: "guessing",
      nextPicture: false,
      person: GameDataStore.currentItem(),
      bucketSizes: GameDataStore.bucketSizes()
    };
  },
  componentDidMount : function () {
    GameDataStore.addListener(this.updateItem);
  },
  updateItem: function () {
    this.setState({
      person: GameDataStore.currentItem(),
      status: GameDataStore.status(),
      nextPicture: false,
      bucketSizes: GameDataStore.bucketSizes()
    });
  },
  currentName: function () {
    return this.state.person.name + " (" + GameDataStore.currentItem().occup + ")";
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
          <Picture src={this.state.person.src} />
          <Message status={this.state.status}
            currentName={this.currentName()}
            currentOcup={GameDataStore.currentItem().occup}/>
          <Controls
            status={this.state.status}
            nextPicture={this.nextPicture}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;


