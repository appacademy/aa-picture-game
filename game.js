(function () {
  $(window).load(function () {
    $('canvas').addClass('hidden');
    $('.loading').addClass('hidden');
    var game = new FlashcardsGame();
  });

  function FlashcardsGame() {
    this.images = $('.game-zone img');
    this.injectTemplate();
    this.$messageDisplay = $('.message-display');
    this.$nextButton = $('.next');
    this.$answerField = $('.answer');
    this.$userInput = $('.user-input');
    this.askingQuestion = true;
    this.newPicture = true;
    this.bindHandlers();
    this.askQuestion();
  }

  FlashcardsGame.prototype.injectTemplate = function () {
    var template = $('.game-template').text();
    $('.game-zone').append(template);
  };

  FlashcardsGame.prototype.bindHandlers = function () {
    var game = this;
    this.$userInput.submit(function (event) {
      event.preventDefault();
      game.askingQuestion ? game.checkAnswer() : game.askQuestion();
    });
  };

  FlashcardsGame.prototype.checkAnswer = function () {
    var fullName = this.$activeImg.attr('alt');
    var occupation = ' (' + this.$activeImg.attr('occup') + ').';
    var answer = this.$answerField.val().toLowerCase();
    var guess = FuzzySet([fullName.toLowerCase()]).get(answer);
    this.askingQuestion = false;

    if (guess === null) {
      this.newPicture = false;
      this.print('Nope, it was ' + fullName + occupation);
    } else if (guess[0][1] === answer) {
      this.newPicture = true;
      this.print("That's right! It was " + fullName + occupation);
    } else {
      this.newPicture = true;
      this.print('Almost! It was ' + fullName + occupation);
    }
    var game = this;
    this.$answerField.addClass('hidden');
    this.$nextButton.removeClass('hidden').focus();
  };

  FlashcardsGame.prototype.randomImg = function () {
    var i = Math.floor(Math.random() * this.images.length);
    return this.images.eq(i);
  };

  FlashcardsGame.prototype.print = function (message) {
    this.$messageDisplay.text(message);
  };

  FlashcardsGame.prototype.askQuestion = function () {
    this.askingQuestion = true;
    this.$nextButton.addClass('hidden');
    this.$answerField.removeClass('hidden');
    this.$answerField.val('').focus();
    if (this.newPicture) {
      this.$activeImg && this.$activeImg.removeClass('visible');
      this.$activeImg = this.randomImg();
      this.$activeImg.addClass('visible');
    }
    this.print('Who do you think this is?');
  };
})();
