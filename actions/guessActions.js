var Dispatcher = require('../dispatcher');

var guessActions = {
  addGuess: function (guess) {
    Dispatcher.dispatch({
      actionType: "GUESS_ADDED",
      guess: guess
    });
  },
  nextItem: function () {
    Dispatcher.dispatch({
      actionType: "NEXT_ITEM"
    });
  },
  setItem: function (key) {
    Dispatcher.dispatch({
      actionType: "SET_ITEM",
      key: key
    });
  }
};

module.exports = guessActions;
