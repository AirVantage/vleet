const RandomGenerator = require('./random');
const IncrementGenerator = require('./increment');
const GeoLocationGenerator = require('./geoloc');
const StaticValueGenerator = require('./staticValue');

module.exports = function(generatorConfig) {
    switch (generatorConfig.generator) {
        case 'randomBoolean':
        case 'randomFloat':
        case 'randomInteger':
        case 'randomString':
            return new RandomGenerator(generatorConfig);
        case 'incremental':
            return new IncrementGenerator(generatorConfig.options);
        case 'geoloc':
            return new GeoLocationGenerator(generatorConfig.options);
        case 'staticValue':
            return new StaticValueGenerator(generatorConfig.options);
        default:
            // Look for a custom generator
            const CustomGenerator = require('../../custom-generators/' + generatorConfig.generator);

            if (CustomGenerator) {
                return new CustomGenerator(generatorConfig);
            }

            return new RandomGenerator({
                generator: 'randomString'
            });
    }
};
