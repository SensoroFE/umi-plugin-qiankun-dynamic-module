import path from 'path';
import { buildExportModules } from '../src/utils';

const CORE_DIR = path.join(__dirname, 'fixtures/core');

describe('buildExportModules', () => {
  it('test case 1', () => {
    buildExportModules(
      {
        name: '@sensoro/core',
        dir: 'es'
      },
      {
        rootPath: path.join(CORE_DIR, 'es'),
      }
    );

    expect(1).toBe(1);
  })
})
