import nunjucks from 'nunjucks';
import { ID_PREFIX } from './constants';

interface RenderFileTemplateArgs {
  imports: string[];
  modelFunctions: string[];
}
export function renderFileTemplate({ imports, modelFunctions }: RenderFileTemplateArgs) {
  return nunjucks.render('seedFunctionsFile/templates/seed.nunjs', {
    imports,
    modelFunctions,
  });
}

interface RenderModelFunctionTemplateArgs {
  name: string;
  values: { name: string; defaulter: string }[];
  primaryKey?: string;
}
export function renderModelFunctionTemplate({
  name,
  values,
  primaryKey = 'id',
}: RenderModelFunctionTemplateArgs) {
  return nunjucks.render('seedFunctionsFile/templates/modelFunctions.nunjs', {
    name,
    values,
    primaryKey,
    idPrefix: ID_PREFIX,
  });
}
