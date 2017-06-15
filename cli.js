#!/usr/bin/env node

'use strict';
const _ = require('lodash');
const AirVantage = require('airvantage');
const conzole = require('conzole');
const fs = require('fs');
const jsonfile = require('jsonfile');
const program = require('commander');
const splash = require('./lib/splash');

const packageJson = jsonfile.readFileSync(`${__dirname}/package.json`);

program
    .version(packageJson.version)
    .usage('[options] <your-setup.json> (default: setup.json)')
    .option('-c, --clean', 'Clean the simulated resources (Systems, Gateways, Applications with the "simulationLabel")')
    .parse(process.argv);

if (program.args.length > 1) {
    conzole.failed('1 file max expected');
    return 1;
}

const clean = program.clean;

const customSetupFile = program.args && program.args[0];
const setupFile = customSetupFile || 'setup.json';
const setup = jsonfile.readFileSync(`./${setupFile}`);

let serverConfig;
// First check for a local datacenter config
try {
    serverConfig = jsonfile.readFileSync(`./config/${setup.dataCenter}.json`);
} catch (error) {
    // Otherwise take the default one
    serverConfig = jsonfile.readFileSync(`${__dirname}/config/${setup.dataCenter}.json`);
}

const credentials = _.extend({}, setup.credentials, serverConfig.credentials);
const simulation = jsonfile.readFileSync(`./simulations/${setup.simulation}.json`);

splash({ clean, setupFile, setup, credentials, simulation });

const Simulator = require('./lib/simulator');
const airvantage = new AirVantage({
    serverUrl: `https://${serverConfig.server}`,
    credentials: credentials,
    companyUid: setup.companyUid,
    debug: true
});

const factory = require('./lib/factory')(airvantage, simulation);
const simulator = new Simulator({
    airvantageClient: airvantage,
    simulation: simulation,
    configuration: { server: serverConfig.server }
});


function getSimulationLabel() {
    if (simulation.simulationLabel) {
        return [simulation.simulationLabel];
    }

    return [simulation.label];
}

airvantage.authenticate()
    .then(function() {
        conzole.done('Authenticated');
        if (clean || simulation.clean) {
            return factory.clean();
        } else {
            return factory.initialize()
                .then(function() {
                    conzole.start('Start simulation - ', getSimulationLabel()[0]);
                    return airvantage.querySystems({ labels: getSimulationLabel() });
                })
                .then(function(systems) {
                    conzole.quote('For ', systems.length, 'systems');
                    return simulator.start(systems);
                })
                .then(function() {
                    conzole.ln().title('Simulation succeeded');
                });
        }
    })
    .catch(error => conzole.failed('ERROR:', error.response ? error.response.body : error.stack));
