/**
 * Created by Estevao on 23-07-2015.
 */
(function () {
  'use strict';

  require('chai').should();
  var showdown = require('showdown'),
      imagepreview = require('../src/ghost-image-preview.js'),
      fs = require('fs'),
      cases = fs.readdirSync('test/cases/')
          .filter(filter())
          .map(map('test/cases/')),
      issues = fs.readdirSync('test/issues/')
          .filter(filter())
          .map(map('test/issues/')),
      regex = fs.readdirSync('test/regex/')
        .filter(filter())
        .map(map('test/regex/', '.rgx'));

  var converter = new showdown.Converter({
    extensions: [imagepreview],
    omitExtraWLInCodeBlocks: true,
    parseImgDimensions: true,
    simplifiedAutoLink: true,
    excludeTrailingPunctuationFromURLs: true,
    literalMidWordUnderscores: true,
    strikethrough: true,
    tables: true,
    tablesHeaderId: true,
    ghCodeBlocks: true,
    tasklists: true,
    smoothLivePreview: true,
    simpleLineBreaks: true,
    requireSpaceBeforeHeadingText: true,
    ghMentions: false,
    encodeEmails: true
  });

  /////////////////////////////////////////////////////////////////////////////
  // Test cases
  //
  describe('Ghost Extra Extension cases testcase', function () {
    for (var i = 0; i < cases.length; ++i) {
      it(cases[i].name, assertion(cases[i]));
    }
  });

  describe('Ghost Extra Extension issues testcases', function () {
    for (var i = 0; i < issues.length; ++i) {
      it(issues[i].name, assertion(issues[i]));
    }
  });

  describe('Ghost Extra Extension regex testcases', function () {
    for (var i = 0; i < regex.length; ++i) {
      it(regex[i].name, regexAssertion(regex[i]));
    }
  });

  /////////////////////////////////////////////////////////////////////////////
  // Test cases
  //
  function filter() {
    return function (file) {
      var ext = file.slice(-3);
      return (ext === '.md');
    };
  }

  function map(dir, ext) {
    return function (file) {
      ext = ext || '.html';
      var name = file.replace('.md', ''),
          htmlPath = dir + name + ext,
          html = fs.readFileSync(htmlPath, 'utf8'),
          mdPath = dir + name + '.md',
          md = fs.readFileSync(mdPath, 'utf8');

      return {
        name:     name.replace(/_/g, ' '),
        input:    md,
        expected: html
      };
    };
  }

  //Normalize input/output
  function normalize(testCase) {

    // Normalize line returns
    testCase.expected = testCase.expected.replace(/\r/g, '');
    testCase.actual = testCase.actual.replace(/\r/g, '');

    // Ignore all leading/trailing whitespace
    testCase.expected = testCase.expected.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');
    testCase.actual = testCase.actual.split('\n').map(function (x) {
      return x.trim();
    }).join('\n');

    return testCase;
  }

  function assertion(testCase) {
    return function () {
      testCase.actual = converter.makeHtml(testCase.input);
      testCase = normalize(testCase);

      // Compare
      testCase.actual.should.equal(testCase.expected);
    };
  }

  function regexAssertion(testCase) {
    return function () {
      testCase.actual = converter.makeHtml(testCase.input);
      testCase.expected = testCase.expected.trim().replace(/^\//, '').replace(/\/$/, '');
      testCase.expected = new RegExp(testCase.expected);

      testCase.actual.should.match(testCase.expected);
    };
  }
})();
