import fs from 'fs';
import { join, parse, dirname } from 'path';
import { winPath } from '@umijs/utils';
import { sourceFormatter } from '@sensoro/babel-plugin-dynamic-module/es/utils';

import type { ExportModule, ModuleInfo } from './types';

interface BuildExportModulesOpts {
  rootPath: string;
}

export const buildExportModules = (
  moduleInfo: ModuleInfo,
  {
    rootPath,
  }: BuildExportModulesOpts
) => {
    const modules: ExportModule[] = [];

    function traverse(dir: string) {
      const attributeName = sourceFormatter(moduleInfo.name + winPath(dir.replace(rootPath, '')), {
        moduleName: moduleInfo.name
      });
      fs.readdirSync(dir).forEach((file: string) => {
        const pathname = join(dir, file);
        if (fs.statSync(pathname).isDirectory()) {
          traverse(pathname);
        } else {
          if (
            /\.(js|ts|jsx|tsx)$/.test(file) &&
            !/\.(d|test).(ts|tsx)$/.test(file)
          ) {
            const filename = parse(pathname).name.replace(/\-/g, '$');
            if (filename === 'index') {
              modules.push({ name: attributeName, path: dirname(pathname) });
            } else {
              modules.push({
                name: `${attributeName}$${filename}`,
                path: join(dirname(pathname), parse(pathname).name),
              });
            }
          }
        }
      });
    }
    traverse(rootPath);

    return modules.map(module => ({
      ...module,
      path: winPath(module.path),
    }));
  };
