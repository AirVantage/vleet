import test from 'ava';
import StaticValueGenerator from '../../lib/generators/staticValue';

test('defaults', t => {
    const gen = new StaticValueGenerator();
    t.is(gen.generate(), undefined);
});

function mirror(t, input) {
    let gen = new StaticValueGenerator({ value: input });
    t.is(gen.generate(), input);
}

test('String value', mirror, 'plop');
test('Integer value', mirror, 1);
test('Float value', mirror, 3.45);
test('Boolean value', mirror, false);
test('Undefined value', mirror, undefined);
test('Null value', mirror, null);
