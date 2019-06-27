class timeHandler {
  constructor(mqttClient) {
    this.mqttClient = mqttClient;
    this.allowedTime;
    this.interval;
    this.nowDate;
    this.endDate;
    this.userId;
  }

  countTime(allowedTime, id) {
    this.userId = id;
    this.allowedTime = allowedTime;
    this.nowDate = new Date();

    this.interval = setInterval(() => {
      this.mqttClient.sendMessage('stop', 'actuator');
      clearInterval(this.interval);
      this.endTime();
    }, this.allowedTime);
  }

  endTime() {
    this.clearBathInterval();
    this.endDate = new Date();

    const bathTime = this.endDate - this.nowDate;

    console.log('BATHTIME>>>', bathTime);
    //TODO: SAVE TO DB with this.userId;
  }

  clearBathInterval(){
    clearInterval(this.interval);
  }
}

module.exports = timeHandler;