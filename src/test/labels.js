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
};
