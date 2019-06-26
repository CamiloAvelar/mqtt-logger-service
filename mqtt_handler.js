const mqtt = require('mqtt');
const EventEmitter = require('events');


class MqttHandler extends EventEmitter {
  constructor() {
    super();
    this.mqttClient = null;
    this.host = 'mqtt://localhost';
    this.username = 'mqtt_user'; // mqtt credentials if these are needed to connect
    this.password = '100200300';
  }


  connect() {
    const self = this;
    this.mqttClient = mqtt.connect(this.host, { username: this.username, password: this.password });

    this.mqttClient.on('error', (err) => {
      console.log(err);
      this.mqttClient.end();
    });

    this.mqttClient.on('connect', () => {
      console.log(`mqtt client connected to ${this.host}`);
    });

    this.mqttClient.on('close', () => {
      console.log(`mqtt client disconnected`);
    });

    this.mqttClient.on('message', (topic, message) => {
      const builtMessage = {
        topic,
        message: message.toString()
      };
      
      self.emit('messageReceived', builtMessage);
    })
  }

  subscribe(topic) {
    this.mqttClient.subscribe(topic, {qos: 0});
  }

  sendMessage(message, topic) {
    this.mqttClient.publish(topic, message);
  }
}

module.exports = MqttHandler;