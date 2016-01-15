var Dispatcher = require('../dispatcher');
var Store = require('flux/utils').Store;
var people = require('../data/people');
var GameData = new Store(Dispatcher);
var FuzzySet = require('../util/fuzzyset');
var buckets = [[], [], []];
var turn = 1;
var status = "guessing";
var currentBuckets = [people, [], []];
var currentBucket = 0;
var currentItemIdx = 0;
var currentItem = currentBuckets[currentBucket][currentItemIdx];

GameData.__onDispatch = function (payload) {
  switch(payload.actionType) {
    case "GUESS_ADDED":
      addGuess(payload.guess);
      break;
    case "NEXT_ITEM":
      advanceItem();
      GameData.__emitChange();
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

var storeState = function () {
  let state = {
    turn,
    status,
    buckets,
    currentBuckets,
    currentBucket,
    currentItemIdx,
    currentItem,
    cycle: "jan16"
  };
  localStorage.faceGameState = JSON.stringify(state);
}

var addGuess = function (answer) {
  var guess = FuzzySet([GameData.currentItem().name.toLowerCase()]).get(answer);
  var guessedItem = currentBuckets[currentBucket].splice(currentItemIdx, 1)[0];

  // currentItemIdx = Math.max(currentItemIdx - 1, 0);
  let bucketIdx = currentBucket;

  if (guess === null) {
    if (currentBucket != 0) {
      bucketIdx -= 1;
    }

    status = "incorrect";
  } else if (guess[0][1] === answer.toLowerCase()) {
    if (currentBucket != 2) {
      bucketIdx += 1;
    }

    status = "correct";
  } else {
    status = "close";
  }

  buckets[bucketIdx].push(guessedItem);

  storeState();
  GameData.__emitChange();
};

var advanceItem = function () {
  //Advance to next non-empty bucket
  while (currentItemIdx + 1 > currentBuckets[currentBucket].length) {
    advanceBucket();
  }

  status = "guessing";
  currentItem = nextItem();

  storeState();
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
    currentItemIdx = 0;
    turn += 1;
  } else {
    currentItemIdx = 0;
  }
};

// Load saved game data
if (localStorage.faceGameState) {
  let dehydratedGameState = JSON.parse(localStorage.faceGameState);

  // Clear saved game data from old cycles
  if (dehydratedGameState.cycle !== "jan16") {
    localStorage.removeItem("faceGameState");
  } else {
    turn = dehydratedGameState.turn;
    status = dehydratedGameState.status;
    buckets = dehydratedGameState.buckets;
    currentBuckets = dehydratedGameState.currentBuckets;
    currentBucket = dehydratedGameState.currentBucket;
    currentItemIdx = dehydratedGameState.currentItemIdx;
    currentItem = dehydratedGameState.currentItem;
    if (status !== "guessing") {
      advanceItem();
    }
  }
}

module.exports = GameData;
