import { expect } from 'chai';

import { YamlParser } from '../../src/parser/YamlParser.js';

describe('yaml parser', () => {
  describe('dump documents', () => {
    it('should dump multiple documents', async () => {
      const parser = new YamlParser();
      const data = parser.dump({}, {});

      expect(data).to.contain('---');
    });
  });

  describe('parse documents', () => {
    it('should parse multiple documents', async () => {
      const parser = new YamlParser();
      const data = parser.parse({
        data: `
foo: {}
---
bar: {}
      `,
        path: '',
      });

      expect(Array.isArray(data)).to.equal(true);
      const EXPECTED_DOCS = 2;
      expect(data.length).to.equal(EXPECTED_DOCS);
    });
  });
});
