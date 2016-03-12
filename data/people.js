var students = require('./students');
var instructors = require('./instructors');

instructors.concat(students).forEach(person => {
  exports[`${person.occup}-${person.id}`] = person
});
