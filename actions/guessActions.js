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
  }
};

module.exports = guessActions;
