import _ from 'lodash';
import test from 'ava';
import RandomGenerator from '../../lib/generators/random';

test('defaults', t => {
    const gen = new RandomGenerator();
    t.true(_.isString(gen.generate()));
});

test('random string', t => {
    let gen = new RandomGenerator({ generator: 'randomString' });
    t.true(_.isString(gen.generate()));

    gen = new RandomGenerator({ generator: 'randomString', options: { length: 3 } });
    t.is(gen.generate().length, 3);


    gen = new RandomGenerator({ generator: 'randomString', options: { pool: 'abc' } });
    const value = gen.generate();
    const notInPool = _.filter(value.split(''), c => !_.includes(['a', 'b', 'c'], c));
    t.is(notInPool.length, 0);
});

test('random float', t => {
    let gen = new RandomGenerator({ generator: 'randomFloat' });
    t.true(isFloat(gen.generate()));

    gen = new RandomGenerator({ generator: 'randomFloat', options: { min: 3.3, max: 4.1 } });
    let values = _.times(20, () => gen.generate());
    t.true(_.every(values, v => v >= 3.3));
    t.true(_.every(values, v => v <= 4.1));
});

test('random integer', t => {
    let gen = new RandomGenerator({ generator: 'randomInteger' });
    t.true(Number.isInteger(gen.generate()));

    gen = new RandomGenerator({ generator: 'randomInteger', options: { min: 3, max: 5 } });
    let values = _.times(10, () => gen.generate());
    t.true(_.every(values, v => v >= 3));
    t.true(_.every(values, v => v <= 5));
});

test('random boolean', t => {
    let gen = new RandomGenerator({ generator: 'randomBoolean' });
    let values = _.times(10, () => gen.generate());
    t.true(_.every(values, _.isBoolean));
});

function isFloat(n) {
    return Number(n) === n && n % 1 !== 0;
}
