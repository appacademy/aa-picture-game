/* global Set:false */

var FuzzySet = require('./util/fuzzyset');
var Dispatcher = require('./dispatcher');
var Store = require('flux/utils').Store;
var GameState = new Store(Dispatcher);
module.exports = GameState;

var _people, _localStorageKey;

// scoring params

const LEARNING_GROUP_SIZE = 3;
const RESHOW_PENALTHY_THRESHOLD = 6;
const GUESSES_TO_KEEP = 4;

// initialization

module.exports.initialize = function(people) {
  _people = Object.assign({}, people);
  delete _people.cohort;
  _localStorageKey = "faceGameState-" + people.cohort;
  loadStoredState();
  syncStateWithPeople();
  updateCurrentKey();
};

// _state

const createBlankState = function() {
  return {
    turn: 0,
    status: "guessing",
    remedialGuess: false,
    guessesByKey: {},
    learningKeys: new Set(),
    knownKeys: new Set(),
    currentKey: null,
    timestamp: Date.now()
  };
};

var _state = createBlankState();

const _resetStoreState = function() {
  _state = createBlankState();
  storeState();
  syncStateWithPeople();
  updateCurrentKey();
  GameState.__emitChange();
};

GameState.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "NEXT_ITEM":
      advanceItem();
      break;
    case "SET_ITEM":
      setCurrentItem(payload.key);
      break;
    case "RESET_GAME_STATE":
      _resetStoreState();
      break;
    case "GUESS_ADDED":
      makeGuess(payload.guessType, payload.guess);
      break;
  }
};

const makeGuess = function(guessType, answer) {
  var correctAnswer;
  if (guessType === "Full Name") {
    correctAnswer = GameState.currentItem().name.toLowerCase();
  } else if(guessType === "First Name") {
    correctAnswer = GameState.currentItem().name.split(" ")[0].toLowerCase();
  }
  var guess = FuzzySet([correctAnswer]).get(answer);

  if (guess === null) {
    _state.status = "incorrect";
  } else if (guess[0][1] === answer.toLowerCase()) {
    _state.status = "correct";
  } else {
    _state.status = "close";
  }

  if (!_state.remedialGuess) {
    addGuess();
  }

  if (_state.status === "incorrect") {
    _state.remedialGuess = true;
  } else {
    _state.remedialGuess = false;
  }

  GameState.__emitChange();
};

GameState.currentItem = function () {
  return _people[_state.currentKey];
};

GameState.status = function () {
  return _state.status;
};

GameState.getScores = function () {
  var totals = {};

  Object.keys(_state.guessesByKey).forEach(function(key) {
    var sum = 0;

    _state.guessesByKey[key].forEach(function(guess) {
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

const setCurrentItem = function(key) {
  _state.currentKey = key;
  _state.status = "guessing";
  _state.remedialGuess = false;
  GameState.__emitChange();
};

const addGuess = function () {
  let guesses = _state.guessesByKey[_state.currentKey];
  guesses.push({
    turn: _state.turn,
    status: _state.status
  });
  while (guesses.length > GUESSES_TO_KEEP) {
    guesses.shift();
  }
  if (_state.status === 'correct') {
    _state.learningKeys.delete(_state.currentKey);
    _state.knownKeys.add(_state.currentKey);
  } else if (_state.status === 'incorrect') {
    _state.knownKeys.delete(_state.currentKey);
    _state.learningKeys.add(_state.currentKey);
  }
};

const advanceItem = function () {
  _state.status = "guessing";
  if (!_state.remedialGuess) {
    updateCurrentKey();
    _state.turn += 1;
  }

  GameState.__emitChange();
};

const updateCurrentKey = function () {
  _state.currentKey = chooseBestKey();
  if (!_state.knownKeys.has(_state.currentKey)) {
    _state.learningKeys.add(_state.currentKey);
  }
};

const chooseBestKey = function () {
  let eligibleKeys;
  if (_state.learningKeys.size < LEARNING_GROUP_SIZE) {
    eligibleKeys = Object.keys(_people);
  } else {
    eligibleKeys = new Set(_state.knownKeys);
    _state.learningKeys.forEach(key => eligibleKeys.add(key));
  }

  let bestKey, bestScore = -1;
  eligibleKeys.forEach(key => {
    const score = scoreItem(_state.guessesByKey[key]);
    if (score > bestScore) {
      bestKey = key;
      bestScore = score;
    }
  });

  return bestKey;
};

const scoreItem = function (guesses) {
  if (guesses.length === 0) return 0.4 + 0.2 * Math.random();

  var recentIncorrect = 0, correct = 0;
  var totalRecords = Object.keys(_state.guessesByKey).length;

  guesses.forEach((guess, i) => {
    var weight = 1 - (_state.turn - guess.turn) / totalRecords;
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
  var turnsSince = _state.turn - lastTurn;

  var score = 0.4 * recentIncorrect
            + 0.4 * (1 - correct)
            + 0.1 * Math.random()
            + 0.1 * turnsSince / totalRecords;
  score = Math.min(1, score);

  if (turnsSince < RESHOW_PENALTHY_THRESHOLD) {
    score *= turnsSince / RESHOW_PENALTHY_THRESHOLD;
  }

  return score;
};

/// localStorage persistence ///

const storeState = function () {
  const storeageState = Object.assign({}, _state);
  storeageState.timestamp = Date.now();
  storeageState.learningKeys = Array.from(_state.learningKeys);
  storeageState.knownKeys = Array.from(_state.knownKeys);
  localStorage.setItem(_localStorageKey, JSON.stringify(storeageState));

  if (localStorage.length > 3) {
    removeOldestStoredItem();
  }
};

const removeOldestStoredItem = function () {
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

const loadStoredState = function () {
  let encodedState = localStorage.getItem(_localStorageKey);
  if (encodedState) {
    _state = createBlankState();
    let storageState = JSON.parse(encodedState);

    Object.keys(_state).forEach(key => {
      if (storageState.hasOwnProperty(key)) {
        if (key === 'learningKeys' || key === 'knownKeys') {
          _state[key] = new Set(storageState[key]);
        } else {
          _state[key] = storageState[key];
        }
      }
    });
    _state.remedialGuess = false; // always start false
  }
};

const syncStateWithPeople = function () {
  removeInvalidGuessKeys();
  addUnusedGuessKeys();
  removeInvalidLearningKeys(_state.learningKeys);
  removeInvalidLearningKeys(_state.knownKeys);
};

const removeInvalidGuessKeys = function () {
  Object.keys(_state.guessesByKey).forEach(key => {
    if (!_people.hasOwnProperty(key)) {
      delete _state.guessesByKey[key];
    }
  });
};

const addUnusedGuessKeys = function () {
  Object.keys(_people).forEach(key => {
    if (!_state.guessesByKey.hasOwnProperty(key)) {
      _state.guessesByKey[key] = [];
    }
  });
};

const removeInvalidLearningKeys = function (set) {
  set.forEach(key => {
    if (!_people.hasOwnProperty(key)) {
      set.delete(key);
    }
  });
};

GameState.addListener(storeState);
