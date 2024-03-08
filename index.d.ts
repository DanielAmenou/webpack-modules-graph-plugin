interface ModulesGraphPluginOptions {
  fileName: string;
}

declare class ModulesGraphPlugin {
  constructor(options: ModulesGraphPluginOptions);

  apply(compiler: any): void;
}

export = ModulesGraphPlugin;
