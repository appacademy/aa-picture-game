# aa-picture-game
Helps students and instructors at App Academy learn each other's names

[Practice Here][aa-picture-game]

[aa-picture-game]: http://appacademy.github.io/aa-picture-game/

## Updating the data

Once the pictures for a cohort get uploaded to Progress Tracker, we can
add them to the name game.

### Update the student data.

1. go to [progress.appacademy.io/students](http://progress.appacademy.io/students/)
2. open dev tools console and run:

  ```javascript
  let students = [];
  $(".classmate-block.block").each(function () {
    const $link = $(this).find("strong a");
    const segments = $link.attr("href").split('/');

    const id = parseInt(segments[segments.length - 1]);
    const name = $link.text();
    const imageUrl = $(this).find("figure img").attr("src");

    student = {id, name, imageUrl, occup: "student"};
    students.push(student);
  });

  console.log(JSON.stringify(students, undefined, 2));
  ```

3. Copy the logged text and paste it into `data/xxStudents.js`. Make sure
  that you maintain the file's module pattern when you do this.

4. Make sure each students' imageUrl begins with `http://` (instead of just `//`)

### Update the instructor data.

Look through the `data/xxInstructors.js` file. Remove any instructors who
have moved on and add any who are new. You can find the relevant data
[here](http://progress.appacademy.io/instructors).

There's no script for this. You'll have to navigate to the previous cohort (where the new TA's student picture lives) and run the script from above there. Copy over the relevant person's information.


### Update the cycle prefix.

1. Open `stores/gameState.js`
2. Find `const CYCLE =` and update the string for the new cycle.

### Test it.

1. Run `npm run webpack`.
2. `open index.html`
3. Make sure all the pictures display properly.
4. Try typing a name for one of the new photos.
5. Make any corrections. Comment out any student who does not have a
  picture.
6. Repeat if you made any changes.

### Finish It.

1. Check in your changes.
2. Push to Github.
3. Email the cohort and let them know it's live!
