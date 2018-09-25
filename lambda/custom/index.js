/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const http = require('http');
const url = require('url');

const HELP_COMMANDS = 'You can say pause, play, play radio or play random.';
const CARD_NAME = 'Mothership'

const mothershipApiRoot = process.env.MOTHERSHIP_API_ROOT;

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to zefer tunes. ' + HELP_COMMANDS;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_NAME, speechText)
      .getResponse();
  },
};

const PauseIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PauseIntent';
  },
  handle(handlerInput) {
    const uri = mothershipApiRoot + '/pause';
    http.get(uri, (res) => {
      res.on('data', (_chunk) => {});
      res.on('end', () => {});
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
    let response = 'Pausing!';
    return handlerInput.responseBuilder
      // .speak(response)
      .withSimpleCard(CARD_NAME, response)
      .getResponse();
  },
};

const PlayIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'PlayIntent';
  },
  handle(handlerInput) {
    const uri = mothershipApiRoot + '/play';
    http.get(uri, (res) => {
      res.on('data', (_chunk) => {});
      res.on('end', () => {});
    }).on("error", (err) => {
      console.log("Error: " + err.message);
    });
    let response = 'Playing!';
    return handlerInput.responseBuilder
      // .speak(response)
      .withSimpleCard(CARD_NAME, response)
      .getResponse();
  },
};

const RadioIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'RadioIntent';
  },
  handle(handlerInput) {
    const data = JSON.stringify({
      uri: "radio/BBC 6 Music.m3u", type: "playlist", replace: true, play: true,
    });
    const uri = url.parse(mothershipApiRoot + '/playlist');
    const options = {
      method: 'POST',
      hostname: uri.hostname,
      port: uri.port,
      path: uri.path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = http.request(options, (res) => {
      res.on('data', (_chunk) => {});
      res.on('end', () => {});
    }).on('error', (_e) => {});

    req.write(data);
    req.end();

    return handlerInput.responseBuilder
      .withSimpleCard(CARD_NAME, 'Playing radio')
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = HELP_COMMANDS;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard(CARD_NAME, speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard(CARD_NAME, speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('I don\'t understand. Please say again.')
      .reprompt('I don\'t understand. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    PauseIntentHandler,
    PlayIntentHandler,
    RadioIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
