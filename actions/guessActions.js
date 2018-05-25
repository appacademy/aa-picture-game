var Dispatcher = require('../dispatcher');

var guessActions = {
  addGuess: function(guessType, guess, city) {
    Dispatcher.dispatch({
      actionType: city + "_GUESS_ADDED",
      guessType: guessType,
      guess: guess
    });
  },

  nextItem: function (city) {
    Dispatcher.dispatch({
      actionType: city + "_NEXT_ITEM"
    });
  },
  setItem: function (key, city) {
    Dispatcher.dispatch({
      actionType: city + "_SET_ITEM",
      key: key
    });
  },

  resetGameState: function(city) {
    Dispatcher.dispatch({
      actionType: city + "_RESET_GAME_STATE"
    });
  }
};

module.exports = guessActions;
