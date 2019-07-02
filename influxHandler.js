const Influx = require('influx');

class InfluxHandler {
  constructor() {
    this.influx;
    this.host = 'influxdb';
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

    this.influx.getDatabaseNames()
      .then(names => {
        if(!names.includes(this.database)) {
          return this.influx.createDatabase(this.database);
        }
      })
      .then(() => {
        console.log('InfluxDB connected!');
      })
  }

  getPoints(id) {
    console.log(id)
    return this.influx.query(
      ` select * from flow_data
        where user_id = '${id}'`
    ).catch(err => {
      console.log(err);
    }).then(results => {
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
    }).catch(err => console.error(`Error saving data to InfluxDB! ${err.stack}`))
      .then(() => {return 'Dados salvos no banco'})
  }
}

module.exports = InfluxHandler;