var React = require('react');
var Picture = require('./Picture');
var Message = require('./Message');
var Controls = require('./Controls');
var ProgressBar = require('./ProgressBar');
var CitySwitcher = require('./CitySwitcher');

var store = require('../store');
var sfInstructors = require('../data/sfInstructors');
var sfStudents = require('../data/sfStudents');
var nyInstructors = require('../data/nyInstructors');
var nyStudents = require('../data/nyStudents');

var concatPeople = function(instructors, students) {
  const people = {};
  instructors.concat(students).forEach(person => {
    people[`${person.occup}-${person.id}`] = person;
  });
  people.cohort = students.cohort;
  return people;
};

const sfPeople = concatPeople(sfInstructors, sfStudents);
const nyPeople = concatPeople(nyInstructors, nyStudents);

var PictureGame = React.createClass({
  getInitialState: function () {
    this.store = store;
    store.initialize(nyPeople);
    return {
      city: "NYC",
      status: "guessing",
      nextPicture: false,
      people: nyPeople,
      person: store.currentItem(),
      scores: store.getScores()
    };
  },
  componentDidMount: function () {
    store.addListener(this.updateItem);
  },
  // componentWillUnmount: function () {
  //   store.removeListener(this.updateItem);
  // },
  updateItem: function () {
    this.setState({
      person: store.currentItem(),
      status: store.status(),
      nextPicture: false,
      scores: store.getScores()
    });
  },
  switchCity: function(city) {
    if (this.state.city === city) return;

    let people;
    if (city === "SF") {
      people = sfPeople;
    } else {
      people = nyPeople;
    }
    store.initialize(people);
    this.setState({
      people,
      city,
      person: store.currentItem(),
      scores: store.getScores()
    });
  },
  currentName: function () {
    return this.state.person.name + " (" + store.currentItem().occup + ")";
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
              currentOcup={store.currentItem().occup}/>
            <Controls
              status={this.state.status}
              nextPicture={this.nextPicture}/>
          </section>
          <ProgressBar scores={this.state.scores} people={this.state.people}/>
          <CitySwitcher city={this.state.city} switchCity={this.switchCity}/>
        </div>
      </div>
    );
  }
});

module.exports = PictureGame;
