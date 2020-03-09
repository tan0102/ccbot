'use strict';

var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var http = require('http');
var app = express();
var token = process.env.token;
var verify_token = "capitonnageinnovationtoken"
app.set('port', (process.env.PORT || 1000))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
 
app.get('/', function (req, res) {
  res.send('Facebook Bot Ok')
});
 
/*
 * (c)Creative commons.
 *  provide by 
 *  www.seed-innov.com
 *
 */
app.get('/webhook', function (req, res) {
  if (req.query['hub.mode'] === 'subscribe' && 
		req.query['hub.verify_token'] === verify_token) {
    console.log("Validating webhook");
    res.status(200).send(req.query['hub.challenge']);
  } else {
    console.error("Failed validation. Make sure the validation tokens match.");
    res.sendStatus(403);
  }
});
 

 /*Fonction appelée par facebook lorqqu'un evenement auquel nous sommes enregistré se produit.
 En cas de latence, plusieurs message peuvent arriver 
 il faut les récuperer un par un et les traiter dans une boucle*/
 
app.post('/webhook', function (req, res) {
	
  var data = req.body;
  if (data.object == 'page') {
    data.entry.forEach(function (pageEntry) {
      var pageID = pageEntry.id;
      var timeOfEvent = pageEntry.time;
      pageEntry.messaging.forEach(function (event) {
        if (event.message && event.message.text) {
          receivedMessage(event);
        }
      });
    });
    res.sendStatus(200);
  }
});

 
function receivedMessage(event) {
  var senderID = event.sender.id;
  var recipientID = event.recipient.id;
  var timeOfMessage = event.timestamp;
  var message = event.message.text;
 let text = event.message.text
            text = text || "";
					var messageText = "Hello Seed";
					var messageData = {
						recipient: { id: senderID },
						message: { text: messageText }
					};
					callSendAPI(messageData);
         
  
}
 
function callSendAPI(messageData) {
  request({
    uri: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: "POST",
    json: messageData
 
  }, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var recipientId = body.recipient_id;
      var messageId = body.message_id;
      console.log("Successfully sent generic message with id %s to recipient %s", messageId, recipientId);
    } else {
      console.error("Unable to send message.");
      console.error(response);
      console.error(error);
    }
  });
}
 
app.listen(app.get('port'), function () {
  console.log('running on port', app.get('port'))
})
