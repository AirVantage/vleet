const conzole = require('conzole');

module.exports = function(config) {

    conzole.title('Launching Vleet simulation');
    if (config.clean) {
        conzole.warn(`Cleaning simulation resources`);
    } else {
        conzole.start(`Initializing simulation`);
    }

    conzole.indent(2).quote(`Configuration file "${config.setupFile}"`)
        .indent(2).fromTo('', `Name: ${config.setup.simulation}`)
        .indent(2).fromTo('', `Data center: ${config.setup.dataCenter}`)
        .indent(2).fromTo('', `User: ${config.credentials.username}`)
        .indent(2).fromTo('', `Fleet size: ${config.simulation.fleet.size}`)
        .indent(2).fromTo('', `Simulation Label: ${config.simulation.simulationLabel || config.simulation.label}`);
};
