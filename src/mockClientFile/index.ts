import { DMMF } from '@prisma/generator-helper';
import nunjucks from 'nunjucks';

interface BuildFileArgs {
  models: DMMF.Datamodel['models'];
}

export default function buildFile({ models }: BuildFileArgs) {
  return nunjucks.render('mockClientFile/templates/index.nunjs', {
    modelNames: models.map(({ name }) => name),
  });
}
