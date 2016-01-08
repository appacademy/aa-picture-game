(function () {
  $(window).load(function () {
    $('canvas').addClass('hidden');
    $('.loading').addClass('hidden');
    var game = new FlashcardsGame();
  });

  function FlashcardsGame() {
    this.images =this.shuffle($('.game-zone img'));
    this.injectTemplate();
    this.$messageDisplay = $('.message-display');
    this.$nextButton = $('.next');
    this.$answerField = $('.answer');
    this.$userInput = $('.user-input');
    this.$restartButton = $('.restart-button');
    this.askingQuestion = true;
    this.newPicture = true;
    this.bindHandlers();
    this.askQuestion();
  }

  FlashcardsGame.prototype.shuffle = function (array) {
    var currentIndex = array.length, temporaryValue, randomIndex ;

    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    };

    return array;
  }

  FlashcardsGame.prototype.injectTemplate = function () {
    var template = $('.game-template').text();
    $('.game-zone').append(template);
  };

  FlashcardsGame.prototype.bindHandlers = function () {
    var game = this;
    game.$userInput.submit(function (event) {
      event.preventDefault();
      if (game.askingQuestion) {
        game.checkAnswer();
      } else{
        game.askQuestion();
      }
    });
    game.$restartButton.click(function(event) {
      event.preventDefault();
      location.reload();
    })
  };

  FlashcardsGame.prototype.checkAnswer = function () {
    var fullName = this.$activeImg.attr('alt');
    var occupation = ' (' + this.$activeImg.attr('occup') + ').';
    var answer = this.$answerField.val().toLowerCase();
    var guess = FuzzySet([fullName.toLowerCase()]).get(answer);
    this.askingQuestion = false;

    if (guess === null) {
      this.newPicture = false;
      this.print('Nope, it was ' + fullName + occupation, 'red');
    } else if (guess[0][1] === answer) {
      this.newPicture = true;
      this.print("That's right! It was " + fullName + occupation, 'green');
    } else {
      this.newPicture = true;
      this.print('Almost! It was ' + fullName + occupation, 'gold');
    }
    var game = this;
    this.$answerField.addClass('hidden');
    this.$nextButton.removeClass('hidden').focus();
  };

  FlashcardsGame.prototype.randomImg = function () {
    var i = Math.floor(Math.random() * this.images.length);
    return this.images.eq(i);
  };

  FlashcardsGame.prototype.nextImg = function () {
    if (this.images.length === 0) {
      this.end();
      return;
    }
    var newImage = this.images.eq(0);
    this.images = this.images.slice(1);
    return newImage;
  };

  FlashcardsGame.prototype.end = function () {
    this.$answerField.addClass('hidden');
    $('input.answer').addClass('hidden');
    this.print("You know everybody!");
    this.$answerField.addClass('hidden');
    this.$nextButton.addClass('hidden');
    this.$restartButton.removeClass('hidden').focus();
  };

  FlashcardsGame.prototype.print = function (message, color) {
    if (color) {
      this.$messageDisplay.attr('style', 'color:' + color)
    } else {
      this.$messageDisplay.attr('style', '')
    }
    this.$messageDisplay.text(message);
  };

  FlashcardsGame.prototype.askQuestion = function () {
    this.askingQuestion = true;
    this.$nextButton.addClass('hidden');
    this.$answerField.removeClass('hidden');
    this.$answerField.val('').focus();
    if (this.newPicture) {
      this.swapImg(this.nextImg());
    }
    this.print('Who do you think this is?');
  };

  FlashcardsGame.prototype.swapImg = function($newImg) {
    this.$activeImg && this.$activeImg.removeClass('visible');
    this.$activeImg = $newImg;
    this.$activeImg && this.$activeImg.addClass('visible');
  };
})();
