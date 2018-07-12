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
          bColor: '#ffffff',
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
