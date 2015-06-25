# aa-picture-game
Helps students and instructors at App Academy learn each other's names

[Practice Here][aa-picture-game]

[aa-picture-game]: http://appacademy.github.io/aa-picture-game/


### How to get student profile photos
(This is clearly a temporary solution!)
- go to [progress.appacademy.io/students](http://progress.appacademy.io/students/)
- open dev tools console and run:

```javascript
var someDiv = $('<div>');
$(".classmate-block.block").each(function (fig) {
  var imgUrl = $(this).find("figure img").attr("src");
  var name = $(this).find("strong a").text();
  var img = $("<img>").attr("src", imgUrl).attr("alt", name);
  someDiv.append(img);
});

someDiv
```
- right-click on `div` and select `Edit as HTML`. Copy all of it and replace images in `index.html`
