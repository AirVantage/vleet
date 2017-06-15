import test from 'ava';
import GeoLocationGenerator from '../../lib/generators/geoloc';

test('defaults', t => {
    const generator = new GeoLocationGenerator();
    let longitude = generator.generate();
    t.true(longitude >= -180);
    t.true(longitude <= 180);
});

test('latitude defaults', t => {
    const generator = new GeoLocationGenerator({ type: 'latitude' });
    let latitude = generator.generate();
    t.true(latitude >= -90);
    t.true(latitude <= 90);
});

test('longitude min', t => {
    const generator = new GeoLocationGenerator({ min: 100 });
    let longitude = generator.generate();
    t.true(longitude >= 100);
    t.true(longitude <= 180);
});

test('longitude max', t => {
    const generator = new GeoLocationGenerator({ max: -95 });
    let longitude = generator.generate();
    t.true(longitude >= -180);
    t.true(longitude <= 80);
});

test('latitude min', t => {
    const generator = new GeoLocationGenerator({ type: 'latitude', min: 80 });
    let longitude = generator.generate();
    t.true(longitude >= 80);
    t.true(longitude <= 90);
});

test('latitude max', t => {
    const generator = new GeoLocationGenerator({ type: 'latitude', max: 80 });
    let longitude = generator.generate();
    t.true(longitude >= -90);
    t.true(longitude <= 80);
});
