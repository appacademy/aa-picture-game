var Dispatcher = require('../dispatcher');

var guessActions = {
  addGuess: function(guessType, guess) {
    Dispatcher.dispatch({
      actionType: "GUESS_ADDED",
      guessType: guessType,
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
