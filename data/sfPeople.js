var students = require('./sfStudents');
var instructors = require('./sfInstructors');

instructors.concat(students).forEach(person => {
  exports[`${person.occup}-${person.id}`] = person;
});
