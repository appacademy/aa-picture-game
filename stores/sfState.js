var FuzzySet = require('../util/fuzzyset');
var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var GameState = new Store(Dispatcher);
module.exports = GameState;

var people = require('../data/sfPeople');

// scoring params

const RESHOW_PENALTHY_THRESHOLD = 10;
const GUESSES_TO_KEEP = 4;

// state

const CYCLE = "18-04-16";
var localStorageKey = "faceGameState-" + CYCLE;
var state = {
  turn: 0,
  status: "guessing",
  remedialGuess: false,
  guessesByKey: {},
  currentKey: null,
  timestamp: Date.now()
};

const _resetStoreState = function() {
  state = {
    turn: 0,
    status: "guessing",
    remedialGuess: false,
    guessesByKey: {},
    currentKey: null,
    timestamp: Date.now()
  };
  storeState();
  syncStateWithPeople();
  updateCurrentItem();
  GameState.__emitChange();
};

GameState.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "SF_NEXT_ITEM":
      advanceItem();
      break;
    case "SF_SET_ITEM":
      setCurrentItem(payload.key);
      break;
    case "SF_RESET_GAME_STATE":
      _resetStoreState();
      break;
    case "SF_GUESS_ADDED":
      makeGuess(payload.guessType, payload.guess);
      break;
  }
};

var makeGuess= function(guessType, answer) {
  var correctAnswer;
  if (guessType === "Full Name") {
    correctAnswer = GameState.currentItem().name.toLowerCase();
  } else if(guessType === "First Name") {
    correctAnswer = GameState.currentItem().name.split(" ")[0].toLowerCase();
  }
  var guess = FuzzySet([correctAnswer]).get(answer);

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
    state.remedialGuess = true;
  } else {
    state.remedialGuess = false;
  }

  GameState.__emitChange();
};

GameState.currentItem = function () {
  return people[state.currentKey];
};

GameState.status = function () {
  return state.status;
};

GameState.getScores = function () {
  var totals = {};

  Object.keys(state.guessesByKey).forEach(function(key) {
    var sum = 0;

    state.guessesByKey[key].forEach(function(guess) {
      if (guess.status === "correct") {
        sum += 1;
      } else if (guess.status === "incorrect") {
        sum -= 1;
      }
    });

    totals[key] = sum;
  });

  return totals;
};

var setCurrentItem = function(key) {
  state.currentKey = key;
  state.status = "guessing";
  state.remedialGuess = false;
  GameState.__emitChange();
};

var addGuess = function () {
  let guesses = state.guessesByKey[state.currentKey];
  guesses.push({
    turn: state.turn,
    status: state.status
  });
  while (guesses.length > GUESSES_TO_KEEP) {
    guesses.shift();
  }
};

var advanceItem = function () {
  state.status = "guessing";
  if (!state.remedialGuess) {
    updateCurrentItem();
    state.turn += 1;
  }

  GameState.__emitChange();
};

var updateCurrentItem = function () {
  chooseBestKey();

  while (!keyIsValid(state.currentKey)) {
    delete state.guessesByKey[state.currentKey];
    chooseBestKey();
  }
};

var chooseBestKey = function () {
  var bestKey, bestScore = -1;
  Object.keys(state.guessesByKey).forEach(key => {
    var score = scoreItem(state.guessesByKey[key]);
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

var scoreItem = function (guesses) {
  if (guesses.length === 0) return 0.4 + 0.2 * Math.random();

  var recentIncorrect = 0, correct = 0;
  var totalRecords = Object.keys(state.guessesByKey).length;

  guesses.forEach((guess, i) => {
    var weight = 1 - (state.turn - guess.turn) / totalRecords;
    switch(guess.status) {
      case "correct":
        correct += 1;
        break;
      case "incorrect":
        recentIncorrect += weight;
        break;
      case "close":
        correct += 0.5;
        recentIncorrect += 0.5 * weight;
        break;
    }
  });

  correct = correct / GUESSES_TO_KEEP;
  recentIncorrect = Math.max(Math.min(recentIncorrect, 1), 0);
  var lastTurn = guesses[guesses.length - 1].turn;
  var turnsSince = state.turn - lastTurn;

  var score = 0.4 * recentIncorrect
            + 0.3 * (1 - correct)
            + 0.2 * Math.random()
            + 0.1 * turnsSince / totalRecords;
  score = Math.min(1, score);

  if (turnsSince < RESHOW_PENALTHY_THRESHOLD) {
    score *= turnsSince / RESHOW_PENALTHY_THRESHOLD;
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
    if (key.slice(0, 14) !== 'faceGameState-') { continue; }

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
};

var syncStateWithPeople = function () {
  removeInvalidKeys();
  addUnusedKeys();
};

var removeInvalidKeys = function () {
  Object.keys(state.guessesByKey).forEach(key => {
    if (!people.hasOwnProperty(key)) {
      delete state.guessesByKey[key];
    }
  });
};

var addUnusedKeys = function () {
  Object.keys(people).forEach(key => {
    if (!state.guessesByKey.hasOwnProperty(key)) {
      state.guessesByKey[key] = [];
    }
  });
};

/// post-load setup ///

loadStoredState();
syncStateWithPeople();
updateCurrentItem();
GameState.addListener(storeState);
