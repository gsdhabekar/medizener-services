// Agenda database connection
var Agenda = require('agenda');
var agenda = new Agenda({
  db: {
    address: 'mongodb://127.0.0.1:27017/medizener',
    collection: 'agendaJobs'
  }
});

// agenda on status
agenda.on('ready', function () {
  agenda.start();
});

module.exports = agenda;