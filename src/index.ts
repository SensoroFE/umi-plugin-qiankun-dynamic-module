import fs from 'fs';
import { join } from 'path';
import { lodash } from '@umijs/utils';
import { buildExportModules } from './utils';

import type { IApi } from '@umijs/types';
import type { ExportModule, Options, ModuleInfo, } from './types';

const DIR_NAME = 'plugin-dynamic-module';

export default function(api: IApi) {
  api.logger.info('use plugin dynamic module');

  api.describe({
    key: 'dynamicModule',
    config: {
      schema(joi) {
        return joi.object({
          forceApply: joi.boolean(), //强制生效，默认只有生产环境生效
          modules: joi.array().items(joi.string()),
        });
      },
    },
  });

  const { qiankun = {} } = api.userConfig;
  const {
    forceApply,
    modules = [
      { name: '@sensoro/core', dir: 'es' },
      '@sensoro/layout',
      '@sensoro/library'
    ],
  }: Options = api.userConfig.dynamicModule ?? {};

  const moduleInfos: ModuleInfo[] = modules.map((module) => {
    if (lodash.isString(module)) {
      return {
        name: module,
        dir: 'lib'
      }
    }
    return module;
  }, [])
  const moduleNames: string[] = moduleInfos.map((module) => {
    return module.name;
  }, [])

  const pluginEnable = api.env !== 'development' || forceApply;

  // 只在qiankun生效
  if (pluginEnable && qiankun) {
    if (qiankun.slave) {
      // @ts-ignore
      api.modifyConfig(memo => {
        const extraBabelPlugins = [
          [require('@sensoro/babel-plugin-dynamic-module'), { modules: moduleNames }],
        ].concat(memo.extraBabelPlugins as any);

        return {
          ...memo,
          extraBabelPlugins,
        };
      });

      api.addRuntimePlugin(() => `@@/${DIR_NAME}/dynamic-use-model`);

      api.onGenerateFiles(() => {
        api.writeTmpFile({
          path: `${DIR_NAME}/dynamic-use-model.ts`,
          content: `import { useModel } from 'umi';
export const qiankun = {
  async mount(props) {
    window.useModel = useModel;
    window.globalThis.useModel = useModel;
  }
};`,
        });
      });
    } else if (qiankun.master) {
      api.addRuntimePlugin(() => `@@/${DIR_NAME}/index`);

      const exportModules = moduleInfos
        .reduce((prev, c) => {
          const modulePath = join(api.paths.absNodeModulesPath!, `${c.name}/${c.dir}`);

          if (fs.existsSync(modulePath)) {
            return prev.concat(
              buildExportModules(c, {
                rootPath: modulePath,
              })
            );
          } else {
            return prev;
          }
        }, [] as ExportModule[])

      const importContent = exportModules.reduce((prev, c) => {
        return (
          prev +
          `import * as ${c.name} from '${c.path.replace(
            `${api.paths.absNodeModulesPath}/`,
            '',
          )}';\n`
        );
      }, '');

      const mountContent = exportModules.reduce((prev, c) => {
        return prev + `window.${c.name} = ${c.name};\n`;
      }, '');

      api.onGenerateFiles(() => {
        api.writeTmpFile({
          path: `${DIR_NAME}/index.ts`,
          content: importContent + mountContent,
        });
      });
    }
  }
}
