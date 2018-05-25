var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var ProgressBar = require('./ProgressBar');
var CitySwitcher = require('./CitySwitcher');
var SFStateStore = require('../stores/sfState');
var NYStateStore = require('../stores/nyState');
var FuzzySet = require('../util/fuzzyset');
var sfPeople = require('../data/sfPeople');
var nyPeople = require('../data/nyPeople');

var PictureGame = React.createClass({
  getInitialState: function () {
    return {
      cityStore: SFStateStore,
      city: "SF",
      status: "guessing",
      nextPicture: false,
      people: sfPeople,
      person: SFStateStore.currentItem(),
      scores: SFStateStore.getScores()
    };
  },
  componentDidMount : function () {
    SFStateStore.addListener(this.updateItem);
    NYStateStore.addListener(this.updateItem);
  },
  updateItem: function () {
    this.setState({
      person: this.state.cityStore.currentItem(),
      status: this.state.cityStore.status(),
      nextPicture: false,
      scores: this.state.cityStore.getScores()
    });
  },
  switchCity: function() {
    let newStore;
    let people;
    let city;
    if (this.state.cityStore === SFStateStore) {
      newStore = NYStateStore;
      people = nyPeople;
      city = "NYC";
    } else {
      newStore = SFStateStore;
      people = sfPeople;
      city = "SF";
    }
    this.setState({
      cityStore: newStore,
      people: people,
      person: newStore.currentItem(),
      scores: newStore.getScores(),
      city: city
    });
  },
  currentName: function () {
    return this.state.person.name + " (" + this.state.cityStore.currentItem().occup + ")";
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
              currentOcup={this.state.cityStore.currentItem().occup}/>
            <Controls
              city={this.state.city}
              status={this.state.status}
              nextPicture={this.nextPicture}/>
          </section>
          <ProgressBar scores={this.state.scores} people={this.state.people} city={this.state.city}/>
          <CitySwitcher switchCity={this.switchCity}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;
