import { DMMF } from '@prisma/generator-helper';
import { renderFileTemplate, renderModelFunctionTemplate } from './template';
import { ID_PREFIX } from './constants';

type Enums = DMMF.Datamodel['enums'];
function getFirstEnumValue(enums: Enums, enumName: string) {
  const { values } = enums.find((e) => e.name === enumName);
  return values[0].name;
}

type OnEnumUsed = (enumName: string) => void;

const fakerMap = {
  String: 'faker.lorem.word()',
  Int: 'faker.datatype.number()',
  DateTime: 'faker.date.recent()',
  Boolean: 'false',
  Decimal: 'new Prisma.Decimal(10)',
};

export function getDefaultingFunctionForField(
  field: DMMF.Field,
  enums: Enums,
  onEnumUsed: OnEnumUsed,
) {
  const hasDefault = field.default !== undefined;

  if (hasDefault && field.type === 'DateTime') {
    // Handles 'DateTime @default(now())'
    return (field.default as DMMF.FieldDefault).name === 'now'
      ? 'new Date()'
      : JSON.stringify(field.default);
  }

  if (hasDefault) {
    return JSON.stringify(field.default);
  }

  // Don't attempt to generate optional fields as these can be difficult to unset
  if (!field.isRequired) {
    return 'null';
  }

  if (typeof field.type !== 'string') {
    return 'null';
  }

  if (field.kind === 'enum') {
    onEnumUsed(field.type);
    return `${field.type}.${getFirstEnumValue(enums, field.type)}`;
  }

  if (field.isId || field.name.includes('Id')) {
    return `'${ID_PREFIX}'` + ' + uuid()';
  }

  return fakerMap[field.type] ?? 'null';
}

export function assembleFunctionForModel(model: DMMF.Model, enums: Enums, onEnumUsed: OnEnumUsed) {
  const values = model.fields
    .map((field) => {
      // Don't attempt to generate any values for relation fields
      if (field.relationName) {
        return undefined;
      }

      return {
        name: field.name,
        defaulter: getDefaultingFunctionForField(field, enums, onEnumUsed),
      };
    })
    .filter(Boolean);

  return renderModelFunctionTemplate({
    name: model.name,
    values,
  });
}

export default function buildFile({ models, enums }: DMMF.Datamodel) {
  const usedEnums = [];

  const onEnumUsed = (enumUsed: string) => {
    if (!usedEnums.includes(enumUsed)) {
      usedEnums.push(enumUsed);
    }
  };
  const modelFunctions = models.map((model) => assembleFunctionForModel(model, enums, onEnumUsed));

  const modelsNames = models.map((model) => model.name);

  const fileToWrite = renderFileTemplate({
    imports: [...usedEnums, ...modelsNames],
    modelFunctions,
  });

  return fileToWrite;
}
