'use strict';

const node3 = {
  value: 'last',
  next: null
};

const node2 = {
  value: 'middle',
  next: node3
};

const node1 = {
  value: 'first',
  next: node2
};

const first = node => node.value;

const rest = node => node.next;

const cons = (newValue, node) => ({ value: newValue, next: node });

const comp = (f, g) => (...args) => f(g(...args));

const map = (list, transform) =>
        (list === null)
        ? null
        : cons(
            comp(transform, first)(list),
            map(rest(list), transform));

console.log('node1:');
console.log(node1);
console.log('');

const result1 = [
  first(node1),
  first(rest(node1)),
  first(rest(rest(node1)))
].join(', ');

console.log('result1:');
console.log(result1);
console.log('');

const newList = map(node1, val => `${val} mapped!`);
console.log('newList:');
console.log(newList);
console.log('');

const result2 = [
  first(newList),
  first(rest(newList)),
  first(rest(rest(newList)))
].join(', ');

console.log('result2:');
console.log(result2);
