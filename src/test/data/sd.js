'use strict';

module.exports = {
0: `And Robert the fourth place .
cc(Robert, And)
orphan(Robert, place)
punct(Robert, .)
amod(place, fourth)
det(place, the)`,

1: `ROOT And Robert the fourth place .
root(ROOT, Robert)
cc(Robert, And)
orphan(Robert, place)
punct(Robert, .)
amod(place, fourth)
det(place, the)`,

2: `ROOT I love French fries .
root(ROOT, love)`,

// https://github.com/UniversalDependencies/docs/blob/pages-source/_u-dep/ccomp.md
ccomp_1: `He says that you like to swim
ccomp(says, like)
mark(like, that)`,

ccomp_2: `He says you like to swim
ccomp(says, like)`,

ccomp_3: `The boss said to start digging
ccomp(said, start)
mark(start, to)`,

ccomp_4: `We started digging
xcomp(started, digging)`,

ccomp_5: `The important thing is to keep calm.
ccomp(is, keep)
nsubj(is, thing)`,

ccomp_6: `The problem is that this has never been tried .
ccomp(is, tried)
nsubj(is, problem)`
};
