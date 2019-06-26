const Influx = require('influx');

class InfluxHandler {
  constructor() {
    this.influx;
    this.host = 'localhost';
    this.database = 'water_flow_data'
  }

  connect() {
    this.influx = new Influx.InfluxDB({
      host: this.host,
      database: this.database,
      schema: [{
        measurement: 'flow_data',
        fields: { flow: Influx.FieldType.INTEGER },
        tags: ['user_id']
      }]
    });
  }

  getPoints(id) {
    console.log(id)
    return this.influx.query(
      ` select * from flow_data
        where user_id = '${id}'`
    ).catch(err => {
      console.log(err);
    }).then(results => {
      console.log(results)
      return results;
    })
  }

  writePoints(id, data) {
    console.log(id, data);
    return this.influx.writePoints([{
      measurement: 'flow_data',
      tags: { user_id: id },
      fields: { flow: data }
    }], {
      database: this.database,
      precision: 's',
    }).catch(err => console.error(`Error saving data to InfluxDB! ${error.stack}`))
      .then(() => {return 'Dados salvos no banco'})
  }
}

module.exports = InfluxHandler;