#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper';
import { parseEnvValue } from '@prisma/internals';
import fs from 'fs';
import path from 'path';

import nunjucks from 'nunjucks';

import buildSeedFunctionsFile from './seedFunctionsFile';
import buildMockClientFile from './mockClientFile';

nunjucks.configure(__dirname, { autoescape: false, throwOnUndefined: true });

generatorHandler({
  onManifest() {
    return {
      defaultOutput: './test-utils',
      prettyName: 'Prisma Test Util Generator',
    };
  },
  async onGenerate(options) {
    const outputDir = parseEnvValue(options.generator.output);

    if (!options.generator.output) {
      throw new Error('No output was specified for Prisma Test Util Generator');
    }

    async function writeTSFile(relativeFilePath: string, fileContents: string) {
      const outputFilePath = path.join(outputDir, relativeFilePath);

      await fs.promises.mkdir(path.dirname(outputFilePath), {
        recursive: true,
      });

      await fs.promises.writeFile(outputFilePath, fileContents);
    }

    try {
      const { models, enums } = options.dmmf.datamodel;

      const seedFunctionsFileContents = buildSeedFunctionsFile({ models, enums });
      await writeTSFile('seed.ts', seedFunctionsFileContents);

      const mockClientFileContents = buildMockClientFile({ models });
      await writeTSFile('mockClient.ts', mockClientFileContents);

      await writeTSFile(
        'index.ts',
        `// WARNING: This is an auto generated file. Do not updated it directly, your changes will be lost.

export * from './seed';
export * from './mockClient';
`,
      );
    } catch (e) {
      console.error('Error: unable to write files for Prisma Schema Generator');
      throw e;
    }
  },
});
