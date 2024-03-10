interface ModulesGraphPluginOptions {
  showOnlyProjectFiles: string;
  fileName: string;
  openFile: boolean;
}

declare class ModulesGraphPlugin {
  constructor(options: ModulesGraphPluginOptions);

  apply(compiler: any): void;
}

export = ModulesGraphPlugin;
