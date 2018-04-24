var NotificationService = require('../api/services/notifications.js');
var UserService = require('../api/services/users.js');
/**
 * Define all agenda definition here
 */
module.exports = function (agenda) {
  
  /**
   * @Notification: Send notification to user
   */
  agenda.define("sendNotification", function (job, done) {
    var data = job.attrs.data;
    // call notification services
    NotificationService.sendMessage({
      registrationToken: data.registrationToken,
      title: data.title,
      message: data.message,
      source: data.source
    },function (err, result) {
      done();
    });
  });

  /**
   * @Users: update users availability information using this cron
   */
  agenda.define("updateAvailability", function (job, done) {
    var data = job.attrs.data;
    // call users services
    UserService.updateUserById({
      query: data.query,
      set: data.set
    }, function (err, result) {
      done();
    });
  });

}