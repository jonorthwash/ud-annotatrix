'use strict';

const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const nx = require('notatrix');

const conllu = require('./data/index')['CoNLL-U'];
const Labeler = require('../labels');
const Manager = require('../manager');
const errors = require('../errors');
global.gui = null;
global.server = null;

//module.exports = () => {
  describe('labels.js', () => {
    describe('parse comments individually', () => {

      const data = [
        {
          name: 'labels_1',
          labels: ['label1', 'another_label', 'a-third-label']
        },
        {
          name: 'labels_2',
          labels: ['one_label', 'second', 'third-label',
            'row_2', 'again:here', 'this', 'that' ]
        },
        {
          name: 'labels_3',
          labels: ['this-is-a-tag', 'test', 'testing']
        },
        {
          name: 'nested_2',
          labels: []
        }
      ];

      _.each(data, datum => {
        it(`should parse labels from CoNLL-U:${datum.name}`, () => {

          const s = new nx.Sentence(conllu[datum.name]),
            labeler = new Labeler();

          labeler.parse(s.comments);
          expect(labeler._labels.map(label => label.name)).to.deep.equal(datum.labels);
        });
      });
    });

    describe('parse comments on aggregate', () => {

      const names = [
        'labels_1',
        'labels_2',
        'labels_3',
        'nested_2'
      ];
      const labels = [
        'label1',
        'another_label',
        'a-third-label',
        'one_label',
        'second',
        'third-label',
        'row_2',
        'again:here',
        'this',
        'that',
        'this-is-a-tag',
        'test',
        'testing'
      ];
      const labeler = new Labeler();

      it(`should parse labels from CoNLL-U:{${names.join(' ')}}`, () => {
        _.each(names, name => {

          const s = new nx.Sentence(conllu[name]);

          labeler.parse(s.comments);
        });

        expect(labeler._labels.map(label => label.name)).to.deep.equal(labels);
      });

    });

    describe(`know whether a given sentence has a given label`, () => {

      const data = {
        labels_1: ['label1', 'another_label', 'a-third-label'],
        labels_2: ['one_label', 'second', 'third-label',
          'row_2', 'again:here', 'this', 'that' ],
        labels_3: ['this-is-a-tag', 'test', 'testing'],
        nested_2: []
      };
      let allLabels = _.reduce(data, (l, labels) => l.concat(labels), []);

      const labeler = new Labeler();

      let i = -1;
      _.each(data, (labels, name) => {
        it(`should read for CoNLL-U:${name}`, () => {
          sinon.stub(manager, 'getSentence').callsFake(i => {
            return new nx.Sentence(conllu[name]);
          });

          manager.index = i++;
          _.each(allLabels, label => {
            expect(labeler.has(label)).to.equal(labels.indexOf(label) > -1);
          });
          manager.getSentence.restore();
        });
      });
    });

    describe('pick a text color sanely', () => {
      global.manager = {
        index: 0,
        getSentence: i => new nx.Sentence('')
      };

      const labelName = 'test',
        labeler = new Labeler();

      labeler.add(labelName);
      const label = labeler.get(labelName);

      const data = [
        {
          bColor: '#000000',
          tColor: '#ffffff'
        },
        {
          bColor: '#0106a0',
          tColor: '#ffffff'
        },
        {
          bColor: '#ffffff',
          tColor: '#000000'
        },
        {
          bColor: '#aaaaaa',
          tColor: '#000000'
        }
      ];

      _.each(data, datum => {
        it(`should pick correctly when background="${datum.bColor}"`, () => {
          label.changeColor(datum.bColor);
          expect(label.tColor).to.equal(datum.tColor);
        });
      });
    });

    describe(`edit an existing label`, () => {

      const labeler = new Labeler();
      labeler.add('default');
      const defaultColor = labeler.get('default').bColor;

      it(`should edit the name`, () => {
        const label = labeler.get('default');

        // change it
        labeler.edit('default', { name: 'changed' });
        expect(label.name).to.equal('changed');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal(defaultColor);

        // change it (to an invalid value)
        labeler.edit('changed', { name: '' });
        expect(label.name).to.equal('changed');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal(defaultColor);

        // change it back
        labeler.edit('changed', { name: 'default' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal(defaultColor);
      });

      it(`should edit the description`, () => {
        const label = labeler.get('default');

        // change it
        labeler.edit('default', { desc: 'description' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('description');
        expect(label.bColor).to.equal(defaultColor);

        // change it back
        labeler.edit('default', { desc: '' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal(defaultColor);
      });

      it(`should change the color`, () => {
        const label = labeler.get('default');

        // change it (with #)
        labeler.edit('default', { color: '#420420' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal('#420420');

        // change it (without #)
        labeler.edit('default', { color: '123456' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal('#123456');

        // change it (to an invalid value)
        labeler.edit('default', { color: '69' });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal('#123456');

        // change it back
        labeler.edit('default', { color: defaultColor });
        expect(label.name).to.equal('default');
        expect(label.desc).to.equal('');
        expect(label.bColor).to.equal(defaultColor);
      });
    });

    describe(`remove an existing label`, () => {
      const labeler = new Labeler();
      labeler.add('default');
      labeler.add('other');

      const labels = () => {
        return labeler._labels.map(label => label.name);
      }

      it(`should remove a label if it exists`, () => {

        // sanity check
        expect(labels()).to.deep.equal(['default', 'other']);

        labeler.remove('other');
        expect(labels()).to.deep.equal(['default']);

      });

      it(`should do nothing if it doesn't exist`, () => {

        // sanity check
        expect(labels()).to.deep.equal(['default']);

        labeler.remove('not-here');
        expect(labels()).to.deep.equal(['default']);

      });

      it(`should update comments accordingly`, () => {

        const data = ['labels_1', 'labels_2', 'labels_3'],
          labels = [
            ['label1', 'another_label', 'a-third-label'],
            ['one_label', 'second', 'third-label', 'row_2', 'again:here', 'this', 'that'],
            ['this-is-a-tag', 'test', 'testing'] ],
          allLabels = _.reduce(labels, (l, labels) => l.concat(labels), []),
          sentences = data.map(name => new nx.Sentence(conllu[name])),
          labeler = new Labeler();

        sinon.stub(manager, 'getSentence').callsFake(i => {
          return sentences[i];
        });

        const parse = i => {
          return Labeler.parseComments(manager.getSentence(i).comments);
        }

        // setup
        for (let i=0; i<data.length; i++) {
          labeler.parse(manager.getSentence(i).comments)
        }

        // sanity check
        expect(labeler._labels.map(label => label.name)).to.deep.equal(allLabels);

        // add a label from 'labels_2' to 'labels_1'
        labeler.addInComments(0, 'one_label');
        labels[0].push('one_label');
        expect(parse(0)).to.deep.equal(labels[0]);

        labeler.remove('one_label');
        labels[0].pop();
        labels[1].splice(0, 1);
        expect(parse(0)).to.deep.equal(labels[0]);
        expect(parse(1)).to.deep.equal(labels[1]);

        manager.getSentence.restore();
      });
    });

    describe(`serialize and deserialize`, () => {

      // ignore the semi-random stuff (i.e. the color hashes)
      const getState = () => {
        return {
          labels: labeler.state.labels.map(label => {
            return {
              name: label.name,
              desc: label.desc
            }
          })
        };
      };

      global.manager = {
        index: 0,
        getSentence: i => new nx.Sentence('')
      };

      const labeler = new Labeler();

      it(`should serialize`, () => {

        labeler.add('one');
        labeler.add('two');
        labeler.add('three');

        expect(getState()).to.deep.equal({
          labels: [
            {
              name: 'one',
              desc: ''
            },
            {
              name: 'two',
              desc: ''
            },
            {
              name: 'three',
              desc: ''
            }
          ]
        });
      });

      it(`should deserialize`, () => {
        _.each([{
          name: 'valid',
        }, {
          name: 'valid',
          desc: ''
        }, {
          name: 'valid',
          desc: 'description string',
        }, {
          name: 'valid',
          desc: '',
          bColor: '#ffffff'
        }, {
          name: 'valid',
          desc: '',
          bColor: 'ffffff'
        }], validLabel => {
          labeler.state = { labels: [validLabel] };
          _.each(validLabel, (value, key) => {

            if (key === 'bColor' && !value.startsWith('#')) {
              expect(labeler.get(validLabel.name)[key]).to.equal(`#${value}`);
            } else {
              expect(labeler.get(validLabel.name)[key]).to.equal(value);
            }

          });
        });
      });

      it(`should throw errors when trying to deserialize from invalid serial data`, () => {
        _.each([{
          name: ''
        }, {
          name: 'valid',
          desc: []
        }, {
          name: 'valid',
          desc: '',
          bColor: 'black'
        }, {
          name: 'valid',
          desc: '',
          bColor: '#fff'
        }], invalidLabel => {
          expect(() => {
            labeler.state = { labels: [invalidLabel] };
          }).to.throw(errors.DeserializationError);
        });
      });
    });

    describe('filter', () => {
      it(`should add and remove things from Labeler._filter by name`, () => {

        const manager = new Manager().parse([
          conllu.labels_1,
          conllu.labels_2,
          conllu.labels_3,
          conllu.labels_4
        ].join('\n\n'));

        console.log(manager._sentences.map(sent => sent._nx.input))

        // should initialize correctly
        expect(manager._filtered.length).to.equal(0);
        expect(labeler._filter.size).to.equal(0);

        // should do nothing when given an invalid name to add
        labeler
          .addFilter('this-is-not-a-valid-name')
          .addFilter(null)
          .addFilter()
          .addFilter([1, 2, 3]);
        expect(labeler._filter.size).to.equal(0);

        // should add to _filter when given a valid name
        labeler
          .addFilter('label1')
          .addFilter('new');
        console.log(labeler)
        expect(labeler._filter.size).to.equal(2);

        // should do nothing when given an invalid name to remove
        labeler
          .removeFilter('this-is-not-a-valid-name')
          .removeFilter('another_label');
        expect(labeler._filter.size).to.equal(2);

        // should remove from _filter when given something being filtered
        labeler
          .removeFilter('new');
        expect(labeler._filter.size).to.equal(1);

      });

      it(`should use Labeler._filter to update Manager._filter correctly`, () => {

        const manager = new Manager().parse([
          conllu.labels_1,
          conllu.labels_2,
          conllu.labels_3,
          conllu.labels_4
        ].join('\n\n'));

        manager.index = 0;

        // this should be on none of the sentences
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([]);
        expect(manager.totalSentences).to.equal('4');

        // this one should only be on sentence #1
        labeler.addFilter('another_label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0]);
        expect(manager.totalSentences).to.equal('1 (total: 4)');

        // this is also only on sentence #1
        labeler.addFilter('a-third-label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0]);
        expect(manager.totalSentences).to.equal('1 (total: 4)');

        // only on #2
        labeler.addFilter('third-label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0, 1]);
        expect(manager.totalSentences).to.equal('2 (total: 4)');

        labeler.removeFilter('third-label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0]);
        expect(manager.totalSentences).to.equal('1 (total: 4)');

        labeler.removeFilter('a-third-label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0]);
        expect(manager.totalSentences).to.equal('1 (total: 4)');

        labeler.removeFilter('another_label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([]);
        expect(manager.totalSentences).to.equal('4');

        // on #1 and #4
        labeler.addFilter('label1');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0, 3]);
        expect(manager.totalSentences).to.equal('2 (total: 4)');

        labeler.clearFilter();
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([]);
        expect(manager.totalSentences).to.equal('4');

      });

      it(`should pan differently when there is a filter`, () => {

        var manager = new Manager().parse([
          conllu.labels_1,
          conllu.labels_2,
          conllu.labels_3,
          conllu.labels_4
        ].join('\n\n'));

        const enforce = num => {
          expect(manager.current).to.equal(manager.getSentence(num));
        };

        const reset = () => {
          labeler.clearFilter();
          manager.updateFilter();
          manager.index = 0;
        }

        // sanity check
        manager.index = 0;
        labeler.addFilter('label1').addFilter('this-is-a-tag');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0, 2, 3]);
        expect(manager.totalSentences).to.equal('3 (total: 4)');
        enforce(0);

        manager.last();
        enforce(3);

        manager.first();
        enforce(0);

        manager.next();
        enforce(2);

        manager.next();
        enforce(3);

        manager.next();
        enforce(3);

        manager.prev();
        enforce(2);

        manager.prev();
        enforce(0);

        manager.prev();
        enforce(0);

        manager.index = 0;
        enforce(0);

        manager.index = 1;
        enforce(2);

        manager.index = 2;
        enforce(3);

        manager.index = 3;
        enforce(3);

        manager.index = Infinity; // fail
        enforce(3);

        manager.index = -1;
        enforce(0);

        // (another test case)
        reset();

        // check what happens when we add a filter than the current
        //   sentence doesn't have
        labeler.addFilter('one_label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([1, 3]);
        expect(manager.totalSentences).to.equal('2 (total: 4)');
        enforce(1);

        manager.last();
        enforce(3);

        manager.first();
        enforce(1);

        manager.next();
        enforce(3);

        manager.next();
        enforce(3);

        manager.prev();
        enforce(1);

        manager.prev();
        enforce(1);

        manager.index = 0;
        enforce(1);

        manager.index = 1;
        enforce(3);

        manager.index = 2;
        enforce(3);

        manager.index = Infinity; // fail
        enforce(3);

        manager.index = -1;
        enforce(1);

        // don't magically change indices after clearing the filter
        labeler.clearFilter();
        manager.updateFilter();
        enforce(1);

        // (another test case)
        reset();

        // make sure we set _filterIndex sanely at the beginning
        manager.index = 1;
        labeler.addFilter('label1').addFilter('one_label');
        manager.updateFilter();
        expect(manager._filtered).to.deep.equal([0, 1, 3]);
        enforce(1);
        expect(manager._filterIndex).to.equal(1);
        expect(manager._index).to.equal(1);

      });
    });
  });
//};
