var FuzzySet = require('../util/fuzzyset');
var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var GameState = new Store(Dispatcher);
module.exports = GameState;

var people = require('../data/people');

var cycle = "mar16";
var localStorageKey = "faceGameState-" + cycle;
var state = {
  turn: 0,
  status: "guessing",
  remedialGuess: false, // you must get it right before moving on
  guessRecords: {},
  currentKey: undefined,
  timestamp: Date.now()
}

var currentGuessRecord = function () {
  return state.guessRecords[state.currentKey];
};

GameState.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "GUESS_ADDED":
      makeGuess(payload.guess);
      break;
    case "NEXT_ITEM":
      advanceItem();
      break;
  }
};

GameState.currentItem = function () {
  return people[state.currentKey];
};

GameState.status = function () {
  return state.status;
};

GameState.bucketSizes = function () {
  var sizes = [0, 0, 0];

  Object.keys(state.guessRecords).forEach(key => {
    var sum = 0

    state.guessRecords[key].guesses.forEach(guess => {
      if (guess.status === "correct") {
        sum += 1
      } else if (guess.status === "incorrect") {
        sum -= 1;
      }
    });

    var idx = Math.floor((sum + 6) / 5);
    sizes[idx] += 1;
  });

  return sizes;
};

var makeGuess = function (answer) {
  var guess = FuzzySet([GameState.currentItem().name.toLowerCase()]).get(answer);

  if (guess === null) {
    state.status = "incorrect";
  } else if (guess[0][1] === answer.toLowerCase()) {
    state.status = "correct";
  } else {
    state.status = "close";
  }

  if (!state.remedialGuess) {
    addGuess();
  }

  if (state.status === "incorrect") {
    state.remedialGuess = true
  } else {
    state.remedialGuess = false
  }

  GameState.__emitChange();
};

var addGuess = function () {
  let guessRecord = currentGuessRecord();
  guessRecord.guesses.push({
    turn: state.turn,
    status: state.status
  });
  while (guessRecord.guesses.length > 5) {
    guessRecord.guesses.shift();
  }
}

var advanceItem = function () {
  state.status = "guessing";
  if (!state.remedialGuess) updateCurrentItem();
  state.turn += 1;

  GameState.__emitChange();
};

var updateCurrentItem = function () {
  chooseBestKey();

  while (!keyIsValid(state.currentKey)) {
    delete state.guessRecords[state.currentKey];
    chooseBestKey();
  }
};

var chooseBestKey = function () {
  var bestKey, bestScore = -1
  Object.keys(state.guessRecords).forEach(key => {
    var score = scoreItem(state.guessRecords[key]);
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  });

  state.currentKey = bestKey;
};

var keyIsValid = function (key) {
  return people.hasOwnProperty(key);
};

var scoreItem = function (record) {
  if (record.guesses.length === 0) return 0.5;

  var recentIncorrect = 0, correct = 0;
  var totalRecords = Object.keys(state.guessRecords).length

  record.guesses.forEach((guess, i) => {
    var weight = 1 - (state.turn - guess.turn) / totalRecords;
    switch(guess.status) {
      case "correct":
        correct += 1
        break;
      case "incorrect":
        recentIncorrect += weight;
        break;
      case "close":
        correct += 0.5
        recentIncorrect += 0.5 * weight;
        break;
    }
  });

  correct = correct / 5;
  recentIncorrect = Math.max(Math.min(recentIncorrect, 1), 0);
  var lastTurn = record.guesses[record.guesses.length - 1].turn;
  var turnsSince = state.turn - lastTurn

  var score = 0.4 * recentIncorrect
            + 0.2 * (1 - correct)
            + 0.2 * turnsSince / totalRecords;
  score = Math.min(1, score);

  if (turnsSince < 15) {
    score *= turnsSince / 15;
  }

  return score;
};

/// localStorage persistence ///

var storeState = function () {
  state.timestamp = Date.now();
  localStorage.setItem(localStorageKey, JSON.stringify(state));

  if (localStorage.length > 3) {
    removeOldestStoredItem();
  }
};

var removeOldestStoredItem = function () {
  var keyToRemove = null;
  var minTimestamp = Date.now();

  for (let i = 0; i < localStorage.length; i++) {
    let key = localStorage.key(i);
    let timestamp = JSON.parse(localStorage.getItem(key)).timestamp || 0;
    if (!timestamp || timestamp < minTimestamp) {
      minTimestamp = timestamp;
      keyToRemove = key;
    }
  }

  if (keyToRemove) {
    localStorage.removeItem(keyToRemove);
    console.log(keyToRemove + " garbage collected");
  }
};

var loadStoredState = function () {
  let encodedState = localStorage.getItem(localStorageKey);
  if (encodedState) {
    let storedState = JSON.parse(encodedState);

    Object.keys(state).forEach(key => {
      if (storedState.hasOwnProperty(key)) {
        state[key] = storedState[key];
      }
    });
    state.remedialGuess = false; // always start false
  }
}

var syncStateWithPeople = function () {
  removeInvalidKeys();
  addUnusedKeys();
};

var removeInvalidKeys = function () {
  Object.keys(state.guessRecords).forEach(key => {
    if (!people.hasOwnProperty(key)) {
      delete state.guessRecords[key];
    }
  });
};

var addUnusedKeys = function () {
  Object.keys(people).forEach(key => {
    if (!state.guessRecords.hasOwnProperty(key)) {
      state.guessRecords[key] = {
        key,
        guesses: []
      };
    }
  });
}

/// post-load setup ///

loadStoredState();
syncStateWithPeople();
updateCurrentItem();
GameState.addListener(storeState);
window.state = state;
