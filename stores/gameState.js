var FuzzySet = require('../util/fuzzyset');
var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var GameState = new Store(Dispatcher);
module.exports = GameState;

var people = require('../data/people');

/* * * How Buckets Work * * *
 * Buckets store keys to the people object.
 * There are 3 buckets: don't-know, learning, and already-know.
 * There are 2 sets of buckets: "seen" and "current" (unseen)
 * When keys are moved from current to seen:
 * - They are moved up one bucket when you get them right.
 * - They are moved back one bucket when you get them wrong.
 * - They aren't moved when you get them kinda right.
 * When a bucket is empty, you advance to the next bucket.
 * When all current buckets are empty, buckets are replenished from
 *  their corresponding seen buckets, but the don't-know bucket is
 *  replenished more frequently than the learning bucket, and the
 *  learning bucket is replenished more frequently than the already-know
 *  bucket
 * * */

var cycle = "mar16";
var localStorageKey = "faceGameState-" + cycle;
var state = {
  turn: 1,
  status: "guessing",
  remedialGuess: false, // you must get it right before moving on
  seenBuckets: [[], [], []],
  currentBuckets: [Object.keys(people), [], []],
  currentBucketIdx: 0,
  currentKeyIdx: 0,
  currentKey: undefined,
  timestamp: Date.now()
}

var currentBucket = function () {
  return state.currentBuckets[state.currentBucketIdx];
};

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
  return people[state.currentKey];
};

GameState.status = function () {
  return state.status;
};

GameState.bucketSizes = function () {
  return state.currentBuckets.map((bucket, idx) => {
    return bucket.length + state.seenBuckets[idx].length;
  });
};

var addGuess = function (answer) {
  var guess = FuzzySet([GameState.currentItem().name.toLowerCase()]).get(answer);

  let bucketIdx = state.currentBucketIdx;

  if (guess === null) {
    state.remedialGuess = true;
    state.status = "incorrect";
    GameState.__emitChange();
    return;
  }

  if (guess[0][1] === answer.toLowerCase()) {
    if (!state.remedialGuess && state.currentBucketIdx !== 2) {
      bucketIdx += 1;
    }
    state.status = "correct";
  } else {
    state.status = "close";
  }

  if (state.remedialGuess && state.currentBucketIdx !== 0) {
    bucketIdx -= 1;
  }
  state.remedialGuess = false;

  currentBucket().splice(state.currentKeyIdx, 1)[0];
  state.seenBuckets[bucketIdx].push(state.currentKey);

  GameState.__emitChange();
};

var advanceItem = function () {
  //Advance to next non-empty bucket
  while (state.currentKeyIdx + 1 > currentBucket().length) {
    advanceBucket();
  }

  state.status = "guessing";
  setCurrentItemToRandomValidItem();

  GameState.__emitChange();
};

var setCurrentItemToRandomValidItem = function () {
  randomizeCurrentKey();

  while (!currentKeyIsValid()) {
    currentBucket().splice(state.currentKeyIdx, 1);
    randomizeCurrentKey();
  }
};

var randomizeCurrentKey = function () {
  randomizeCurrentKeyIndex();
  state.currentKey = currentBucket()[state.currentKeyIdx];
};

var randomizeCurrentKeyIndex = function () {
  var currentBucketLength = currentBucket().length;
  state.currentKeyIdx = Math.floor(Math.random() * currentBucketLength);
};

var currentKeyIsValid = function () {
  return people.hasOwnProperty(state.currentKey);
};

var advanceBucket = function () {
  state.currentBucketIdx += 1;

  //Switch back to items from previous state.turn if there are no non-empty buckets or
  //all buckets for the state.turn have been used
  if ((state.turn % (state.currentBucketIdx + 1) !== 0) ||
       state.currentBucketIdx >= state.currentBuckets.length) {
    state.currentBuckets.forEach((bucket, idx) => {
      state.currentBuckets[idx] = bucket.concat(state.seenBuckets[idx]);
      state.seenBuckets[idx] = [];
    });

    state.currentBucketIdx = 0;
    state.turn += 1;
  }
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
  }
}

/// post-load setup ///

loadStoredState();
setCurrentItemToRandomValidItem();
GameState.addListener(storeState);