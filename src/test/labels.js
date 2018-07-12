'use strict';

const _ = require('underscore'),
  expect = require('chai').expect,
  sinon = require('sinon'),
  utils = require('./utils');
utils.setupLogger();

const nx = require('notatrix');

const data = require('./data/index');
const LabelManager = require('../labels');
const errors = require('../errors');

module.exports = () => {
  describe('labels.js', () => {
    describe('parse comments individually', () => {

      const _data = [
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

      _.each(_data, datum => {
        it(`should parse labels from CoNLL-U:${datum.name}`, () => {

          const conllu = data['CoNLL-U'][datum.name],
            s = nx.Sentence.fromConllu(conllu),
            labeler = new LabelManager();

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
      const labeler = new LabelManager();

      it(`should parse labels from CoNLL-U:{${names.join(' ')}}`, () => {
        _.each(names, name => {

          const conllu = data['CoNLL-U'][name],
            s = nx.Sentence.fromConllu(conllu);

          labeler.parse(s.comments);
        });

        expect(labeler.labels.map(label => label.name)).to.deep.equal(labels);
      });

    });

    describe(`know whether a given sentence has a given label`, () => {

      const _data = {
        labels_1: ['label1', 'another_label', 'a-third-label'],
        labels_2: ['one_label', 'second', 'third-label',
          'row_2', 'again:here', 'this', 'that' ],
        labels_3: ['this-is-a-tag', 'test', 'testing'],
        nested_2: []
      };
      let allLabels = _.reduce(_data, (l, labels) => l.concat(labels), []);

      const labeler = new LabelManager();

      let i = -1;
      _.each(_data, (labels, name) => {
        it(`should read for CoNLL-U:${name}`, () => {
          const stub = sinon.stub(manager, 'getSentence').callsFake(i => {
            return nx.Sentence.fromConllu(data['CoNLL-U'][name]);
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

      const labelName = 'test',
        label = new LabelManager().add(labelName).get(labelName);

      const _data = [
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

      _.each(_data, datum => {
        it(`should pick correctly when background="${datum.bColor}"`, () => {
          label.changeColor(datum.bColor);
          expect(label.tColor).to.equal(datum.tColor);
        });
      });
    });
  });
};
