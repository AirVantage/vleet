const _ = require('lodash');
const Bromise = require('bluebird');
const conzole = require('conzole');
const generators = require('../generators');
const moment = require('moment');
const mqtt = require('mqtt');

const MQTT_PORT = '1883';

B2TFEngine.prototype.sendData = function (systemData) {
    return new Bromise((resolve, reject) => {
        const system = systemData.system,
            data = systemData.data,
            mqttId = getMQTTId(system, this.simulation),
            mqttPwd = system.communication.mqtt.password,
            mqttClient = createMQTTClient(mqttId, mqttPwd, this.mqttServer);

        mqttClient.on('error', (e) => {
            mqttClient.end();
            conzole.failed('[MQTT]', system.name, '- Error while connecting');
            conzole.failed(e);
            reject(e);
        });

        mqttClient.on('connect', () => {
            conzole.done('System', mqttId, 'connected ');
            mqttClient.publish(mqttId + '/messages/json', JSON.stringify(data), () => {
                mqttClient.end();
                conzole.indent(4).fromTo(system.name, JSON.stringify(data));
                resolve();
            });
        });
    });
};

B2TFEngine.prototype.generateData = function (system) {
    var self = this;
    conzole.start('Generate data for system:', system.name);
    var data = {};
    // Compute the interval between the values per day
    var minutesOffset = (24 / this.getValuesPerDay()) * 60;
    conzole.quote('Minutes offset by day:', minutesOffset);

    try {
        _.times(this.getDaysInPast(), (day) => {
            conzole.indent(2).start(`Day #${day}`);
            var currentDay = moment()
                .subtract(self.getDaysInPast() - day, 'days')
                .hours(0)
                .minutes(0)
                .seconds(0);

            _.times(self.getValuesPerDay(), (nthValue) => {
                var timeOfDay = currentDay.add(minutesOffset, 'minutes');
                conzole
                    .indent(2)
                    .quote('Nth value of day:', nthValue, 'Time :', timeOfDay.format('dddd, MMMM Do YYYY, h:mm:ss a'));

                var timestamp = timeOfDay.valueOf();
                data[timestamp] = {};
                for (var dataDescriptor in self.getGenerationData()) {
                    const value = self.generateValue(dataDescriptor, system);
                    data[timestamp][dataDescriptor] = value;
                    conzole.indent(4).fromTo(dataDescriptor, value);
                }
            });
        });
    } catch (error) {
        conzole.failed('Data generation error:', error.stack);
    }
    return data;
};

B2TFEngine.prototype.generateValue = function (dataDescriptor, system) {
    var generationConfig = this.getDataGenerationConfig(dataDescriptor);
    var generator = this.dataGenerators[dataDescriptor];
    if (!generator) {
        generator = this.getGenerator(generationConfig);
        this.dataGenerators[dataDescriptor] = generator;
    }

    return generator.generate(system);
};

B2TFEngine.prototype.getGenerator = function (generatorId) {
    return generators(generatorId);
};

B2TFEngine.prototype.getDataGenerationConfig = function (dataId) {
    return this.simulation.generation.data[dataId];
};

B2TFEngine.prototype.getGenerationData = function () {
    return this.simulation.generation.data;
};

B2TFEngine.prototype.getDaysInPast = function () {
    return this.simulation.generation.backToTheFuture.nbDaysInPast;
};

B2TFEngine.prototype.getValuesPerDay = function () {
    return this.simulation.generation.backToTheFuture.valuesPerDay;
};

function getMQTTId(system, simulation) {
    const commIdField = _.get(simulation, 'fleet.communicationId', 'serialNumber');
    return system.gateway[commIdField];
}

function createMQTTClient(mqttId, mqttPwd, mqttServer) {
    var options = { username: mqttId, password: mqttPwd };
    conzole.start('Send data');
    conzole.quote('Create mqtt client:', MQTT_PORT, mqttServer, options);
    return mqtt.connect(mqttServer, options);
}

function B2TFEngine(simulation, config) {
    this.simulation = simulation;
    this.mqttServer = 'tcp://' + config.server;
    this.dataGenerators = {};
}

B2TFEngine.prototype.start = function (systems) {
    var self = this;
    this.systems = systems;
    var fleetData = _.map(this.systems, (system) => ({ system, data: this.generateData(system) }));

    return Bromise.mapSeries(fleetData, (systemData) => this.sendData(systemData));
};

module.exports = B2TFEngine;
