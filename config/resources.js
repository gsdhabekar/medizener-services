'use strict';

var xoauth2 = require('xoauth2');

const resource = {
  'privateKey': '@medizener123',
  'adminEmail': 'medizener@gmail.com',
  'gmail': {
    // host: 'smtp.gmail.com',
    'service': "Gmail",
    'port': 465,
    'secure': true,
    'auth': {
      'user': 'medizener@gmail.com',
      'pass': '#Medi:developer01'
    }
  },
  'mail_connection': 'smtps://medizener@gmail.com:#Medi:developer01@smtp.gmail.com',
  'XOAuth2': xoauth2.createXOAuth2Generator({
    'user': 'medizener@gmail.com',
    'clientId': '391747712355-u1c5c65br93f60es5dtn0ta8mhvdmf89.apps.googleusercontent.com',
    'clientSecret': 'P2lp_6R5C5GMCzFDFkCoNGeQ',
    'refreshToken': '1/Ob4TRhZIcCiMPOuJpb6YwVnmM6VuMgbWKJR12cN1jqo',
    'accessToken': 'ya29.Ci9oA9st0uyGBs362rekqqvVZSeeMUw5xw4K2beYSsMLFtNJeh0ikOMBc6ysseZ1fA'
  }),
  'reset': {
    'url': 'RESET_IP'
  },
  'verify': {
    'url': 'VERIFY_IP'
  },
  'AWS': {
    'ACCESS_KEY_ID': 'AKIAIBGTJJN6ZNJJLU5A',
    'SECRET_ACCESS_KEY': '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',
    'REGION': 'us-east-1'
  },
  'S3': {
    'apiVersion': '2006-03-01',
    'endpoint': 'https://s3.amazonaws.com/',
    'BUCKET_NAME': 'medizener'
  }
};

module.exports = resource;