import { createTypstCompiler } from '@myriaddreamin/typst.ts/dist/esm/compiler.mjs';

export type CompileTypstOptions = {
    mainContent: string;
    additionalFiles?: Record<string, string>;
};

export const compileTypst = async (options: CompileTypstOptions) => {
    const mainFilePath = '/main.typ';

    const cc = createTypstCompiler();
    await cc.init({ beforeBuild: [] });

    cc.addSource(mainFilePath, options.mainContent);

    for (const [path, content] of Object.entries(options.additionalFiles || {})) cc.addSource(path, content);

    return await cc.compile({ mainFilePath, format: 'pdf' });
};
