const requestService = require('./requestService');

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
      this.clearBathInterval();
    }, this.allowedTime);
  }

  async endTime() {
    this.clearBathInterval();
    this.endDate = new Date();

    const bathTime = this.endDate - this.nowDate;

    console.log('BATHTIME>>>', bathTime);
    await this._requestUserService(bathTime);
  }

  clearBathInterval(){
    clearInterval(this.interval);
  }

  async _requestUserService(time) {
    const requestOptions = {
      type: 'POST',
      endpoint: 'banho',
      body: {
        user_id: this.userId,
        bath_time: time
      },
    };

    return await requestService.userRequest(requestOptions);
  }
}

module.exports = timeHandler;