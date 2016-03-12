var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var people = require('../data/people');
var GameData = new Store(Dispatcher);
var FuzzySet = require('../util/fuzzyset');
var buckets = [[], [], []]; // [don't know, learning, know]
var turn = 1;
var status = "guessing";
var remedialGuess = false; // you must get it right before moving on
var currentBuckets = [people, [], []];
var currentBucket = 0;
var currentItemIdx;
var currentItem;
var cycle = "mar16";
var localStorageKey = "faceGameState-" + cycle;

GameData.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "GUESS_ADDED":
      addGuess(payload.guess);
      break;
    case "NEXT_ITEM":
      advanceItem();
      break;
  }
};

GameData.currentItem = function () {
  return currentItem;
};

var nextItem = function () {
  return currentBuckets[currentBucket][currentItemIdx];
};

GameData.status = function () {
  return status;
};

GameData.bucketSizes = function () {
  return currentBuckets.map((bucket, idx) => {
    return bucket.length + buckets[idx].length;
  });
};

var addGuess = function (answer) {
  var guess = FuzzySet([GameData.currentItem().name.toLowerCase()]).get(answer);

  // currentItemIdx = Math.max(currentItemIdx - 1, 0);
  let bucketIdx = currentBucket;

  if (guess === null) {
    remedialGuess = true;
    status = "incorrect";
    GameData.__emitChange();
    return;
  }

  if (guess[0][1] === answer.toLowerCase()) {
    if (!remedialGuess && currentBucket !== 2) {
      bucketIdx += 1;
    }
    status = "correct";
  } else {
    status = "close";
  }

  if (remedialGuess && currentBucket !== 0) {
    bucketIdx -= 1;
  }
  remedialGuess = false;

  console.log(status, remedialGuess)
  currentBuckets[currentBucket].splice(currentItemIdx, 1)[0];
  buckets[bucketIdx].push(currentItem);
  randomizeNextItem();

  GameData.__emitChange();
};

var advanceItem = function () {
  //Advance to next non-empty bucket
  while (currentItemIdx + 1 > currentBuckets[currentBucket].length) {
    advanceBucket();
  }

  status = "guessing";
  currentItem = nextItem();

  GameData.__emitChange();
};

var advanceBucket = function () {
  currentBucket += 1;

  //Switch back to items from previous turn if there are no non-empty buckets or
  //all buckets for the turn have been used
  if ((turn % (currentBucket + 1) !== 0) || currentBucket >= currentBuckets.length) {
    currentBuckets.forEach((bucket, idx) => {
      currentBuckets[idx] = bucket.concat(buckets[idx]);
      buckets[idx] = [];
    });

    currentBucket = 0;
    turn += 1;
  }
};

var randomizeNextItem = function () {
  var currentBucketLength = currentBuckets[currentBucket].length
  currentItemIdx = Math.floor(Math.random() * currentBucketLength);
};
randomizeNextItem();
currentItem = nextItem();

/// localStorage persistence ///

var storeState = function () {
  let state = {
    turn,
    status,
    buckets,
    currentBuckets,
    currentBucket,
    currentItemIdx,
    currentItem,
    timestamp: Date.now()
  };
  localStorage.setItem(localStorageKey, JSON.stringify(state));

  if (localStorage.length > 3) {
    removeOldestStoredItem();
  }
};

GameData.addListener(storeState);

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
    currentBucket = storedGameState.currentBucket;
    currentItemIdx = storedGameState.currentItemIdx;
    currentItem = storedGameState.currentItem;
    if (status !== "guessing") {
      advanceItem();
    }
  }
}

loadStoredState();

window.getState = function() {
  return JSON.parse(localStorage.getItem(localStorageKey));
};
module.exports = GameData;
