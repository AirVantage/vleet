const _ = require('lodash');

function StaticValueGenerator(options) {
    _.defaults(this, options);
}

StaticValueGenerator.prototype.generate = function() {
    return this.value;
};

module.exports = StaticValueGenerator;
