# aa-picture-game
Helps students and instructors at App Academy learn each other's names

[Practice Here][aa-picture-game]

[aa-picture-game]: http://appacademy.github.io/aa-picture-game/


### How to get student profile photos
(This is clearly a temporary solution!)
- go to [progress.appacademy.io/students](http://progress.appacademy.io/students/)
- open dev tools console and run:

  ```javascript
  var students = [];
  $(".classmate-block.block").each(function (fig) {
    var $link = $(this).find("strong a");
    var segments = $link.attr("href").split('/');

    var id = parseInt(segments[segments.length - 1]);
    var name = $link.text();
    var imageUrl = $(this).find("figure img").attr("src");

    student = {id: id, name: name, imageUrl: imageUrl, occup: "student"};
    students.push(student);
  });

  console.log(JSON.stringify(students, undefined, 2));
  ```

- Copy the logged text and paste it into `data/students.js`.
- Run `webpack`.
- Check in your changes.
