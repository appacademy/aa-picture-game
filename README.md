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
  var name = $(this).find("strong a").text();
  var src = $(this).find("figure img").attr("src");

  student = {occup: "student", src: src, name: name};
  students.push(student);
});

console.log(JSON.stringify(students, undefined, 2));
```
- Copy the logged text and paste it into `data/students.js`.
