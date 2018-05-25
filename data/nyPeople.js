var students = require('./nyStudents');
var instructors = require('./nyInstructors');

instructors.concat(students).forEach(person => {
  exports[`${person.occup}-${person.id}`] = person;
});
