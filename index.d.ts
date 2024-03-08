interface ModulesGraphPluginOptions {
  showOnlyProjectFiles: string;
  fileName: string;
}

declare class ModulesGraphPlugin {
  constructor(options: ModulesGraphPluginOptions);

  apply(compiler: any): void;
}

export = ModulesGraphPlugin;
