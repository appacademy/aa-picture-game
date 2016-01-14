var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var GameDataStore = require('../stores/gameData');
var FuzzySet = require('../util/fuzzyset');

var PictureGame = React.createClass({
  getInitialState: function () {
    return {
      status: "guessing",
      nextPicture: false,
      person: GameDataStore.currentItem()
    };
  },
  componentDidMount : function () {
    GameDataStore.addListener(this.updateItem);
  },
  updateItem: function () {
    this.setState({
      person: GameDataStore.currentItem(),
      status: GameDataStore.status(),
      nextPicture: false
    });
  },
  currentName: function () {
    return this.state.person.alt;
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

        <div className="game-zone">
          <Picture src={this.state.person.src} />
          <Message status={this.state.status} currentName={this.currentName()}/>
          <Controls
            status={this.state.status}
            nextPicture={this.nextPicture}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;


