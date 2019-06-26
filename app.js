const mqttHandler = require('./mqtt_handler');
const KeysTopicHandler = require('./keysTopicHandler');
const SUBSCRIBE_TOPICS = ['keys', 'actuator', 'user', 'sensor'];
const influx = require('./influxHandler');

const mqttClient = new mqttHandler();
const keysHandler = new KeysTopicHandler(mqttClient);
const influxDB = new influx();

influxDB.connect();
mqttClient.connect();

SUBSCRIBE_TOPICS.forEach((topic) => {
  mqttClient.subscribe(topic);
})

let usuario;
mqttClient.on('messageReceived', (received) => {
  switch(received.topic) {
    case 'keys':
      keysHandler.handle(received.message);
      break;
    case 'actuator':
      if(received.message === 'start') {
        console.log('STARTING ACTUATOR, OPENING VALVULE');
      }

      if(received.message === 'stop') {
        console.log('STOPING ACTUATOR, CLOSING VALVULE');
        influxDB.getPoints(usuario)
          .then(console.log);
      }
      break;
    case 'sensor':
      influxDB.writePoints(usuario, received.message)
        .then(console.log)
        .catch(console.log);
      break;
    case 'user':
      const message = JSON.parse(received.message);
      console.log(`USUARIO ${message.name}`);
      usuario = message.id;
      break;
  }
})