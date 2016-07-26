var Dispatcher = require('../dispatcher');

var guessActions = {
  addFullNameGuess: function (guess) {
    Dispatcher.dispatch({
      actionType: "FULL_NAME_GUESS_ADDED",
      guess: guess
    });
  },

  addFirstNameGuess: function(guess) {
    Dispatcher.dispatch({
      actionType: "FIRST_NAME_GUESS_ADDED",
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
  },

  resetGameState: function() {
    Dispatcher.dispatch({
      actionType: "RESET_GAME_STATE"
    });
  }
};

module.exports = guessActions;
