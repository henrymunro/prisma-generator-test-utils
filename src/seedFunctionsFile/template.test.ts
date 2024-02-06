import nunjucks from 'nunjucks';
import path from 'path';
import { renderModelFunctionTemplate, renderFileTemplate } from './template';

nunjucks.configure(path.join(__dirname, '..'));

test('renderModelFunctionTemplate', () => {
  const result = renderModelFunctionTemplate({
    name: 'User',
    values: [
      {
        name: 'name',
        defaulter: 'faker.name.firstName()',
      },
      {
        name: 'email',
        defaulter: 'faker.internet.email()',
      },
    ],
  });

  expect(result).toMatchSnapshot();
});

test('renderFileTemplate', () => {
  const result = renderFileTemplate({
    imports: ['User', 'Role'],
    modelFunctions: ['functions for model 1', 'functions for model 2'],
  });

  expect(result).toMatchSnapshot();
});
