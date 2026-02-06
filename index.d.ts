interface ModulesGraphPluginOptions {
  showOnlyProjectFiles?: boolean;
  filename?: string;
  openFile?: boolean;
}

declare class ModulesGraphPlugin {
  constructor(options: ModulesGraphPluginOptions);

  apply(compiler: any): void;
}

export = ModulesGraphPlugin;
