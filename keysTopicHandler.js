const requestService = require('./requestService');

class KeysHandler {
  constructor(mqttClient) {
    this.keyBuffer = '';
    this.working = false;
    this.gettingPassword = false;
    this.userId;
    this.mqttClient = mqttClient;
  }

  async handle(message) {
    if(message === '*') {
      this.working = !this.working;
      this.gettingPassword = false;
      return;
    }

    if((this.working || this.gettingPassword) && message !== '#') {
      this.keyBuffer += message;
    }

    if(message === '#') {
      this.working = false;
      try {
        const response = await this._requestUserService();
        console.log(response);
        this.gettingPassword ? (response.allowed ? this.mqttClient.sendMessage('start', 'actuator') : console.log('NAO AUTORIZADO')) : this.mqttClient.sendMessage(JSON.stringify(response), 'user');
        this.gettingPassword = !this.gettingPassword;
      } catch (err) {
        console.log(err.message)
      } finally {
        this.keyBuffer = '';
      }
    }
  }

  async _requestUserService() {
    const requestOptions = this.gettingPassword ? {
      type: 'POST',
      endpoint: `usuario/autorizar`,
      body:{
        id: this.userId,
        password: this.keyBuffer
      },
    }: {
      type: 'GET',
      endpoint: `usuario/${this.keyBuffer}`,
      body: null,
    };

    return requestService.userRequest(requestOptions)
      .then((response) => {
        this.userId = this.gettingPassword ? this.userId : response.id;
        return response
      }).catch(err => {throw err});
  }
}

module.exports = KeysHandler;