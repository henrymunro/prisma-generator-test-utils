import nunjucks from 'nunjucks';
import path from 'path';
import { DMMF } from '@prisma/generator-helper';

import buildFile from '.';

nunjucks.configure(path.join(__dirname, '..'));

test('Renders the mock client as expected', () => {
  const models: DMMF.Datamodel['models'] = [
    {
      name: 'User',
      dbName: 'User',
      fields: [],
      uniqueFields: [],
      uniqueIndexes: [],
      primaryKey: null,
    },
    {
      name: 'Post',
      dbName: 'Post',
      fields: [],
      uniqueFields: [],
      uniqueIndexes: [],
      primaryKey: null,
    },
  ];
  const output = buildFile({ models });

  expect(output).toMatchSnapshot();
});
