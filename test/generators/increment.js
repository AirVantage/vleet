import test from 'ava';
import IncrementGenerator from '../../lib/generators/increment';

test('defaults', t => {
    const generator = new IncrementGenerator();
    let value = generator.generate();
    t.is(value, 0);
    value = generator.generate();
    t.is(value, 1);
});

test('reset threshold', t => {
    const generator = new IncrementGenerator({ resetThreshold: 1 });
    let value = generator.generate();
    t.is(value, 0);
    value = generator.generate();
    t.is(value, 1);
    value = generator.generate();
    t.is(value, 0);
});

test('negative increment', t => {
    const generator = new IncrementGenerator({ step: -1 });
    let value = generator.generate();
    t.is(value, 0);
    value = generator.generate();
    t.is(value, -1);
});

test('float support', t => {
    const generator = new IncrementGenerator({ step: 0.25 });
    let value = generator.generate();
    t.is(value, 0);

    value = generator.generate();
    t.is(value, 0.25);
});

test('float precision', t => {
    const generator = new IncrementGenerator({ start: 3, step: -0.1, precision: 2 });
    let value = generator.generate();
    t.is(value, 3);

    value = generator.generate();
    t.is(value, 2.9);
});

test('reset threshold with floats', t => {
    const generator = new IncrementGenerator({ start: 3, step: -0.1, resetThreshold: 2 });
    let value = generator.generate();
    t.is(value, 3);
    value = generator.generate();
    value = generator.generate();
    t.is(value, 2.8);
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    value = generator.generate();
    t.is(value, 3);
});
