const mqttHandler = require('./mqtt_handler');
const KeysTopicHandler = require('./keysTopicHandler');
const TimeHandler = require('./timeHandler');

const SUBSCRIBE_TOPICS = ['keys', 'actuator', 'user', 'sensor'];
const influx = require('./influxHandler');

const mqttClient = new mqttHandler();
const keysHandler = new KeysTopicHandler(mqttClient);
const timeHandler = new TimeHandler(mqttClient);
const influxDB = new influx();

influxDB.connect();
mqttClient.connect();

SUBSCRIBE_TOPICS.forEach((topic) => {
  mqttClient.subscribe(topic);
})

let usuario;
let sensorCount = 0;
let actuatorOn;
mqttClient.on('messageReceived', (received) => {
  switch(received.topic) {
    case 'keys':
      if(!actuatorOn) {
        keysHandler.handle(received.message);
      }
      break;
    case 'actuator':
      if(received.message === 'start') {
        console.log('STARTING ACTUATOR, OPENING VALVULE');
        timeHandler.countTime(usuario.allowedBathTime * 60000, usuario.id) // usuario.allowedBathTime * 60000
        mqttClient.sendMessage('ON', `homeassistant/binary_sensor/${usuario.name}/state`);
        actuatorOn = true;
      }

      if(received.message === 'stop') {
        console.log('STOPING ACTUATOR, CLOSING VALVULE');
        timeHandler.endTime();
        if(usuario) {
          influxDB.getPoints(usuario.id)
            .then(/*console.log*/);
        }
        sensorCount = 0;
        actuatorOn = false;
        mqttClient.sendMessage('OFF', `homeassistant/binary_sensor/${usuario.name}/state`);
      }
      break;
    case 'sensor':
      if(usuario) {
        if(received.message < 100) sensorCount++;
  
        if(sensorCount > 10) {
          mqttClient.sendMessage('stop', 'actuator');
          sensorCount = 0;
        };
  
        influxDB.writePoints(usuario.id, received.message)
          .then(console.log)
          .catch(console.log);
      } else {
        console.log('NO USER DETECTED, STOPPING ACTUATOR');
        mqttClient.sendMessage('stop', 'actuator')
      };
      break;
    case 'user':
      const message = JSON.parse(received.message);
      console.log(`USUARIO ${message.name}`);
      usuario = message;
      break;
  }
})