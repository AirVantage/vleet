const _ = require('lodash');
const chance = require('chance').Chance();

function RandomGenerator(options) {
    _.defaults(this, options, { generator: 'randomString', options: {} });
}

RandomGenerator.prototype.generate = function() {
    return this[this.generator].call(this);
};

RandomGenerator.prototype.randomString = function() {
    return chance.string({ pool: this.options.pool, length: this.options.length });
};

RandomGenerator.prototype.randomFloat = function() {
    return chance.floating({ min: this.options.min, max: this.options.max, fixed: this.options.fixed });
};

RandomGenerator.prototype.randomInteger = function() {
    return chance.integer({ min: this.options.min, max: this.options.max });
};

RandomGenerator.prototype.randomBoolean = function() {
    return chance.bool({ likelihood: this.options.likelihood });
};

module.exports = RandomGenerator;
