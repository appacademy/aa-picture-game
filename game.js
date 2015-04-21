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
    this.bindHandlers();
    this.askQuestion();
  }

  FlashcardsGame.prototype.injectTemplate = function () {
    var template = $('.game-template').text();
    $('.game-zone').append(template);
  };

  FlashcardsGame.prototype.bindHandlers = function () {
    var game = this;
    this.$answerField.keypress(function (event) {
      if (event.which === 13) {
        var guess = $(event.currentTarget).val();
        game.checkAnswer(guess);
      }
    });
  };

  FlashcardsGame.prototype.checkAnswer = function (guess) {
    var fullName = this.$activeImg.attr('alt');
    var firstName = fullName.split(' ')[0];
    if (firstName.toLowerCase() === guess.toLowerCase()) {
      this.print("That's right! It was " + fullName + '.');
    } else if (firstName.toLowerCase().score(guess.toLowerCase(), 0.8) >= 0.4) {
      this.print('Almost! It was ' + fullName + '.');
    } else {
      this.print('Nope, it was ' + fullName + '.');
    }
    var game = this;
    this.$answerField.addClass('hidden');
    this.$nextButton.removeClass('hidden').focus().keypress(function (event) {
      game.askQuestion();
    });
  };

  FlashcardsGame.prototype.randomImg = function () {
    var i = Math.floor(Math.random() * this.images.length);
    return this.images.eq(i);
  };

  FlashcardsGame.prototype.print = function (message) {
    this.$messageDisplay.text(message);
  };

  FlashcardsGame.prototype.askQuestion = function () {
    this.$nextButton.addClass('hidden');
    this.$answerField.removeClass('hidden');
    this.$answerField.val('').focus();
    this.$activeImg && this.$activeImg.removeClass('visible');
    this.$activeImg = this.randomImg();
    this.$activeImg.addClass('visible');
    this.print('Who do you think this is?');
  };
})();
