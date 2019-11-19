import { expect } from 'chai';

import { YamlParser } from '../../src/parser/YamlParser';

describe('yaml parser', () => {
  describe('dump documents', () => {
    it('should dump multiple documents', () => {
      const parser = new YamlParser();
      const data = parser.dump({}, {});

      expect(data).to.contain('---');
    });
  });

  describe('parse documents', () => {
    it('should parse multiple documents', () => {
      const parser = new YamlParser();
      const data = parser.parse(`
foo: {}
---
bar: {}
      `);

      expect(Array.isArray(data)).to.equal(true);
      const EXPECTED_DOCS = 2;
      expect(data.length).to.equal(EXPECTED_DOCS);
    });
  });
});
