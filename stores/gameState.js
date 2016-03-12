var FuzzySet = require('../util/fuzzyset');
var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var GameState = new Store(Dispatcher);

var people = require('../data/people');

var cycle = "mar16";
var localStorageKey = "faceGameState-" + cycle;

var turn = 1;
var status = "guessing";
var remedialGuess = false; // you must get it right before moving on

var buckets = [[], [], []]; // [don't know, learning, know]
var currentBuckets = [Object.keys(people), [], []];
var currentBucketIdx = 0;
var currentKey;
var nextKeyIdx;

GameState.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "GUESS_ADDED":
      addGuess(payload.guess);
      break;
    case "NEXT_ITEM":
      advanceItem();
      break;
  }
};

GameState.currentItem = function () {
  return people[currentKey];
};

var nextKey = function () {
  return currentBuckets[currentBucketIdx][nextKeyIdx];
};

GameState.status = function () {
  return status;
};

GameState.bucketSizes = function () {
  return currentBuckets.map((bucket, idx) => {
    return bucket.length + buckets[idx].length;
  });
};

var addGuess = function (answer) {
  var guess = FuzzySet([GameState.currentItem().name.toLowerCase()]).get(answer);

  // nextKeyIdx = Math.max(nextKeyIdx - 1, 0);
  let bucketIdx = currentBucketIdx;

  if (guess === null) {
    remedialGuess = true;
    status = "incorrect";
    GameState.__emitChange();
    return;
  }

  if (guess[0][1] === answer.toLowerCase()) {
    if (!remedialGuess && currentBucketIdx !== 2) {
      bucketIdx += 1;
    }
    status = "correct";
  } else {
    status = "close";
  }

  if (remedialGuess && currentBucketIdx !== 0) {
    bucketIdx -= 1;
  }
  remedialGuess = false;

  currentBuckets[currentBucketIdx].splice(nextKeyIdx, 1)[0];
  buckets[bucketIdx].push(currentKey);
  randomizeNextItem();

  GameState.__emitChange();
};

var advanceItem = function () {
  //Advance to next non-empty bucket
  while (nextKeyIdx + 1 > currentBuckets[currentBucketIdx].length) {
    advanceBucket();
  }

  status = "guessing";
  currentKey = nextKey();

  GameState.__emitChange();
};

var advanceBucket = function () {
  currentBucketIdx += 1;

  //Switch back to items from previous turn if there are no non-empty buckets or
  //all buckets for the turn have been used
  if ((turn % (currentBucketIdx + 1) !== 0) || currentBucketIdx >= currentBuckets.length) {
    currentBuckets.forEach((bucket, idx) => {
      currentBuckets[idx] = bucket.concat(buckets[idx]);
      buckets[idx] = [];
    });

    currentBucketIdx = 0;
    turn += 1;
  }
};

var randomizeNextItem = function () {
  var currentBucketLength = currentBuckets[currentBucketIdx].length
  nextKeyIdx = Math.floor(Math.random() * currentBucketLength);
};
randomizeNextItem();
currentKey = nextKey();

/// localStorage persistence ///

var storeState = function () {
  let state = {
    turn,
    status,
    buckets,
    currentBuckets,
    currentBucketIdx,
    nextKeyIdx,
    currentKey,
    timestamp: Date.now()
  };
  localStorage.setItem(localStorageKey, JSON.stringify(state));

  if (localStorage.length > 3) {
    removeOldestStoredItem();
  }
};

GameState.addListener(storeState);

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
  let encodedGameState = localStorage.getItem(localStorageKey);
  if (encodedGameState) {
    let storedGameState = JSON.parse(encodedGameState);

    // Clear saved game data from old cycles
    turn = storedGameState.turn;
    status = storedGameState.status;
    buckets = storedGameState.buckets;
    currentBuckets = storedGameState.currentBuckets;
    currentBucketIdx = storedGameState.currentBucketIdx;
    nextKeyIdx = storedGameState.nextKeyIdx;
    currentKey = storedGameState.currentKey;
    if (status !== "guessing") {
      advanceItem();
    }
  }
}

loadStoredState();

window.getState = function() {
  return JSON.parse(localStorage.getItem(localStorageKey));
};
module.exports = GameState;
