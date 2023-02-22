export interface ExportModule {
  name: string;
  path: string;
}

export interface ModuleInfo {
  name: string;
  dir: string;
}

export interface Options {
  forceApply?: boolean;
  modules: (string | ModuleInfo)[];
}
