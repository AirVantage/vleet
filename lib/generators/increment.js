const _ = require('lodash');

function IncrementGenerator(options) {
    _.defaults(this, options, { start: 0, step: 1, resetThreshold: undefined, precision: 5 });

    this.initialValue = this.start;
    this.isFloatValue = isFloat(this.step);
    this.lastValue = null;
}

IncrementGenerator.prototype.generate = function() {
    const thresholdReached = (lastValue, resetThreshold) => resetThreshold !== undefined && lastValue === resetThreshold;

    if (this.lastValue === null || thresholdReached(this.lastValue, this.resetThreshold)) {
        this.lastValue = this.initialValue;
    } else {
        this.lastValue = this.lastValue + this.step;
    }

    if (this.isFloatValue) {
        this.lastValue = _.round(this.lastValue, this.precision);
    }

    return this.lastValue;
};

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}

module.exports = IncrementGenerator;
