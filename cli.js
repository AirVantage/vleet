#!/usr/bin/env node

'use strict';
const _ = require('lodash');
const AirVantage = require('airvantage');
const conzole = require('conzole');
const getToken = require('./lib/gettoken');
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
let setup;
try {
    setup = jsonfile.readFileSync(`./${setupFile}`);
} catch (error) {
    let errorMessage = `Something went wrong: ${error.stack}`;
    if (!customSetupFile) {
        errorMessage = 'You did not provide any specific setup file and no setup.json file has been found.';
    }
    conzole.failed(errorMessage);
    return 1;
}

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
const isLocal = !!serverConfig.authFrontServer;
const airvantage = new AirVantage({
    serverUrl: isLocal ? `http://${serverConfig.server}` : `https://${serverConfig.server}`,
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

return new Promise((resolve, reject) => {
    if (!!serverConfig.authFrontServer) {
        conzole.quote(`Auth Front "${serverConfig.authFrontServer}"`);
        return getToken({
            authFrontServer: serverConfig.authFrontServer,
            credentials
        }).then((token) => {
            if (!!token) {
                return airvantage.authenticate({ token }).then(resolve);
            }
            reject(new Error(`Unable to get token from ${serverConfig.authFrontServer}`));
        });
    }
    return airvantage.authenticate().then(resolve);
})
    .then(() => {
        conzole.done('Authenticated');
        if (clean || simulation.clean) {
            return factory.clean();
        } else {
            return factory
                .initialize()
                .then(() => {
                    conzole.start('Start simulation - ', getSimulationLabel()[0]);
                    return airvantage.querySystems({ labels: getSimulationLabel() });
                })
                .then((systems) => {
                    conzole.quote('For ', systems.length, 'systems');
                    return simulator.start(systems);
                })
                .then(() => conzole.ln().title('Simulation succeeded'));
        }
    })
    .catch((error) => conzole.failed('ERROR:', error.response ? error.response.body : error.stack));
