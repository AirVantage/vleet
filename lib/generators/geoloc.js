const _ = require('lodash');
const chance = require('chance').Chance();

/**
 * Longitude range: -180 to 180
 * Latitude range: -90 to 90
 *
 * @class      GeoLocationGenerator (name)
 * @param      {<type>}  options  The options
 */
function GeoLocationGenerator(options) {
    _.defaults(this, options, { type: 'longitude' });
}

GeoLocationGenerator.prototype.generate = function() {
    const options = { min: this.min, max: this.max };
    if (this.type === 'longitude') {
        return chance.longitude(options);
    }

    return chance.latitude(options);
};


module.exports = GeoLocationGenerator;
