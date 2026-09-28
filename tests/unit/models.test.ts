import { describe, it, expect } from 'vitest';
import { ElectionDistrict } from '../../src/models/Election';
import Article from '../../src/models/Article';
import Leader from '../../src/models/Leader';
import History from '../../src/models/History';

describe('Data Model Provenance Requirements', () => {

  it('ElectionDistrict schema should require verificationStatus and source', () => {
    const paths = ElectionDistrict.schema.paths;
    expect(paths).toHaveProperty('verificationStatus');
    expect(paths.verificationStatus.options.enum).toContain('official');
    expect(paths).toHaveProperty('source.url');
  });

  it('Article schema should have isFactCheck and provenance', () => {
    const paths = Article.schema.paths;
    expect(paths).toHaveProperty('isFactCheck');
    expect(paths).toHaveProperty('provenance');
  });

  it('Leader schema should support dataSources for provenance', () => {
    const paths = Leader.schema.paths;
    expect(paths).toHaveProperty('dataSources');
  });

  it('History schema should support sources array', () => {
    const paths = History.schema.paths;
    expect(paths).toHaveProperty('sources');
  });

});
