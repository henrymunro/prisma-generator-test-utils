import { DMMF } from '@prisma/generator-helper';

import { renderFileTemplate, renderModelFunctionTemplate } from './template';
import buildFile, { getDefaultingFunctionForField, assembleFunctionForModel } from '.';

jest.mock('./template', () => ({
  renderFileTemplate: jest.fn(),
  renderModelFunctionTemplate: jest.fn(),
}));

const onEnumUsed = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
});

const enums: DMMF.Datamodel['enums'] = [
  {
    name: 'Enum-1',
    values: [
      {
        name: 'Value-1',
        dbName: null,
      },
      {
        name: 'Value-2',
        dbName: null,
      },
    ],
  },
  {
    name: 'Enum-2',
    values: [
      {
        name: 'Value-a',
        dbName: null,
      },
      {
        name: 'Value-b',
        dbName: null,
      },
    ],
  },
];

describe('getDefaultingFunctionForField', () => {
  test('Not required fields are set to null', () => {
    const field = {
      name: 'userId',
      type: 'String',
      isRequired: false,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('null');
  });

  test('Fields with Id in the name are set to uuid() with the correct prefix', () => {
    const field = {
      name: 'userId',
      type: 'String',
      isId: false,
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe(
      "'seeded_for_test_' + uuid()",
    );
  });

  test('Id fields are set to uuid() with the correct prefix', () => {
    const field = {
      name: 'someField',
      type: 'String',
      isId: true,
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe(
      "'seeded_for_test_' + uuid()",
    );
  });

  test('enum fields are set to the enums first value', () => {
    const field = {
      name: 'someField',
      type: 'Enum-1',
      kind: 'enum',
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('Enum-1.Value-1');
    expect(onEnumUsed).toHaveBeenCalledWith('Enum-1');
  });

  test('string fields default to faker string function', () => {
    const field = {
      name: 'someField',
      type: 'String',
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('faker.lorem.words(3)');
  });

  test('int fields default to faker number function', () => {
    const field = {
      name: 'someField',
      type: 'Int',
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('faker.number.int({ max: 2147483646 })');
  });

  test('datetime fields default to faker recent date function', () => {
    const field = {
      name: 'someField',
      type: 'DateTime',
      isRequired: true,
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('faker.date.recent()');
  });

  test('default values are respected', () => {
    const field = {
      name: 'someField',
      type: 'String',
      isRequired: true,
      default: 'something',
    } as DMMF.Field;

    expect(getDefaultingFunctionForField(field, enums, onEnumUsed)).toBe('"something"');
  });
});

describe('assembleFunctionForModel', () => {
  test('Calls renderModelFunctionTemplate with the expected arguments', () => {
    const model = {
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'String',
          isId: true,
          isRequired: true,
        },
        {
          name: 'name',
          type: 'String',
          isId: false,
          isRequired: true,
        },
      ],
    } as DMMF.Model;

    renderModelFunctionTemplate.mockReturnValue('Some output');

    const output = assembleFunctionForModel(model, enums, onEnumUsed);

    expect(renderModelFunctionTemplate).toHaveBeenCalledWith({
      name: 'User',
      values: [
        { name: 'id', defaulter: "'seeded_for_test_' + uuid()" },
        { name: 'name', defaulter: 'faker.lorem.words(3)' },
      ],
    });

    expect(output).toBe('Some output');
  });
});

describe('buildFile', () => {
  const models = [
    {
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'String',
          isId: true,
          isRequired: true,
        },
        {
          name: 'name',
          type: 'String',
          isId: false,
          isRequired: true,
        },
      ],
    },
  ] as DMMF.Model[];

  test('Calls renderFileTemplate with the expected arguments', () => {
    renderModelFunctionTemplate.mockReturnValue('Some model functions');
    renderFileTemplate.mockReturnValue('Some file output');

    const output = buildFile({ models, enums });

    expect(renderFileTemplate).toHaveBeenCalledWith({
      imports: ['User'],
      modelFunctions: ['Some model functions'],
    });

    expect(output).toBe('Some file output');
  });

  test("Doesn't add duplicate enum imports", () => {
    const modelWithMultipleEnumUses = {
      name: 'User',
      fields: [
        {
          name: 'id',
          type: 'Enum-1',
          kind: 'enum',
          isRequired: true,
        },
        {
          name: 'name',
          type: 'Enum-1',
          kind: 'enum',
          isRequired: true,
        },
        {
          name: 'somethingElse',
          type: 'Enum-2',
          kind: 'enum',
          isRequired: true,
        },
      ],
    } as DMMF.Model;

    renderModelFunctionTemplate.mockReturnValue('Some model functions');
    renderFileTemplate.mockReturnValue('Some file output');

    const output = buildFile({ models: [modelWithMultipleEnumUses], enums });

    expect(renderFileTemplate).toHaveBeenCalledWith({
      imports: [
        'Enum-1', // Only passed once despite being used twice in the model
        'Enum-2',
        'User',
      ],
      modelFunctions: ['Some model functions'],
    });

    expect(output).toBe('Some file output');
  });
});
