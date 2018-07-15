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

module.exports = () => {
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

          const s = nx.Sentence.fromConllu(conllu[datum.name]),
            labeler = new Labeler();

          labeler.parse(s.comments);
          expect(labeler.labels.map(label => label.name)).to.deep.equal(datum.labels);
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

          const s = nx.Sentence.fromConllu(conllu[name]);

          labeler.parse(s.comments);
        });

        expect(labeler.labels.map(label => label.name)).to.deep.equal(labels);
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
            return nx.Sentence.fromConllu(conllu[name]);
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
        getSentence: i => nx.Sentence.fromText('')
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
        return labeler.labels.map(label => label.name);
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
          sentences = data.map(name => nx.Sentence.fromConllu(conllu[name])),
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
        expect(labeler.labels.map(label => label.name)).to.deep.equal(allLabels);

        // add a label from 'labels_2' to 'labels_1'
        labeler.addLabel(0, 'one_label');
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
        getSentence: i => nx.Sentence.fromText('')
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
      it(`should add and remove things from the active filter`, () => {
        const manager = new Manager().parse([
          conllu.labels_1,
          conllu.labels_2,
          conllu.labels_3,
          conllu.labels_4
        ].join('\n\n'));

        console.log(manager.length, labeler);
      });
    });
  });
};
