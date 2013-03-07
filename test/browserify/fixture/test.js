var queue = require('./index.js');

function log(text) {
  console.log(text + '\n');
  if (document.getElementById('results')) {
    document.getElementById('results').innerHTML += text + '<br />';
  }
}

function comment(text) {
  log('# ' + text);
}
function bail() {
  log('Bail out!');
}
function plan(start, end) {
  log(start + '..' + end);
}
var n = 1;
var passes = 0;
var failures = 0;
function pass(description) {
  passes++;
  description = description.split('\n').join('\n   ');
  log('ok ' + (n++) + ' - ' + description);
}
function fail(description) {
  failures++;
  description = description.split('\n').join('\n       ');
  log('not ok ' + (n++) + ' - ' + description);
}
function expect(success, message, fmessage) {
  if (success) pass(message || 'Assertion passed');
  else fail(fmessage || message || 'Assertion failed');
}

function test(name, fn) {
  comment(name);
  try {
    fn();
  } catch (er) {
    fail(er.toString());
  }
}

function matchesSpec(q) {
  expect(typeof q.enqueue === 'function', 'enqueue should be a function');
  expect(typeof q.dequeue === 'function', 'dequeue should be a function');
  expect(typeof q.peek === 'function', 'peek should be a function');
  expect(typeof q.isEmpty === 'function', 'isEmpty should be a function');

  q.enqueue(1);
  q.enqueue(2);
  expect(!q.isEmpty());
  expect(q.peek() === 1);
  expect(!q.isEmpty());
  expect(q.dequeue() === 1);
  expect(!q.isEmpty());
  q.enqueue(3);
  expect(!q.isEmpty());
  expect(q.dequeue() === 2);
  expect(!q.isEmpty());
  expect(q.dequeue() === 3);
  expect(q.isEmpty());
}
comment('As object');

matchesSpec(queue());

comment('As mixin');

function Foo() {}
var q = queue(new Foo());
expect(q instanceof Foo, 'works as mixin', 'didn\'t work as mixin');
matchesSpec(q);

plan(1, passes + failures);

comment('tests ' + (passes + failures));
comment('pass ' + passes);
comment('fail ' + failures);