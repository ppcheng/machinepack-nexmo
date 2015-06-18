module.exports = {


  friendlyName: 'Send text message',


  description: 'Send a text message using the Nexmo SMS API',


  cacheable: false,


  sync: false,


  idempotent: false,


  inputs: {

    apiKey: {
      example: 'n3xm0rocks',
      description: 'Your NEXMO API Key.',
      required: true
    },

    apiSecret: {
      example: '12ab34cd',
      description: 'Your NEXMO API Secret.',
      required: true
    },

    from: {
      example: '18479121345',
      description: 'Sender SMS number.',
      extendedDescription: 'The number may be alphanumeric (Ex: from=MyCompany20). Restrictions may apply, depending on the destination.',
      required: true
    },

    to: {
      example: '447525856424',
      description: 'Recipient SMS number.',
      extendedDescription: 'Mobile number in international format, and one recipient per request. Ex: to=447525856424 or to=00447525856424 when sending to UK.',
      required: true
    },

    text: {
      example: 'D%c3%a9j%c3%a0+vu',
      description: 'Body of the text message.',
      extendedDescription: 'Maximum length of a text message is 3200 characters, UTF-8 and URL encoded value.',
      required: true
    },

    protocol: {
      example: 'http',
      description: 'Default protocol for the request is https. User can switch to http.'
    }
  },


  exits: {

    error: {
      description: 'An unexpected error occurred.'
    },

    requestError: {
      description: 'Fail to send the text message.'
    },

    success: {
      description: 'Message has been successfully sent.'
    }

  },


  fn: function (inputs,exits) {
    var request = require('superagent');

    var protocol = inputs.protocol || 'https';
    var baseUrl  = protocol + '://rest.nexmo.com';
    var smsUrl   = baseUrl + '/sms/json';

    request
      .get(smsUrl)
      .query({
        api_key: inputs.apiKey,
        api_secret: inputs.apiSecret,
        from: inputs.from,
        to: inputs.to,
        text: inputs.text
      })
      .end(function(err, res) {
        if (err) return exits.error(err);

        var result = res.body.messages.reduce(function (initialValue, currentValue, index, array) {
          if (parseInt(currentValue.status) !== 0) {
            initialValue.numFails += 1;
            initialValue.fails.push({
              messageId: currentValue['message-id'],
              statusCode: currentValue['status'],
              errorText: currentValue['error-text']
            });
          }
          return initialValue;
        }, {
          numFails: 0,
          fails: []
        });

        if (result.numFails === 0) {
          return exits.success(res.body);
        } else {
          return exits.requestError(result);
        }
      });
  },



};
