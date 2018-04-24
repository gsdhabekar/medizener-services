'use strict';

var nodemailer = require('nodemailer');
var _CONST	   = require('./resources.js');

// create reusable transporter object using the default SMTP transport 
var transporter = nodemailer.createTransport('SMTP', _CONST.gmail);

// Mailer module to send emails
module.exports = {
	sendMail: function(message, callback) {
		// setup e-mail data with unicode symbols 
		var mailOptions = {
      from: '"Medizener" <medizener@gmail.com>', // sender address 
      to: message.email, // list of receivers 
      subject: message.subject, // Subject line  
      html: message.html // html body
		};
		 
		// send mail with defined transport object 
		transporter.sendMail(mailOptions, function(error, info){
      if(error){
        callback(error);
      }else{
        callback(null, 'Email is sent.');
      }
		});
	}
}