export interface ExportModule {
  name: string;
  path: string;
}

export interface ModuleInfo {
  name: string;
  dir: string;
}

export interface Options {
  /** 强制生效，默认只有生产环境生效 */
  forceApply?: boolean;
  modules: (string | ModuleInfo)[];
}
