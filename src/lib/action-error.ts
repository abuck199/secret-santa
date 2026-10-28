// Turn a failed Server Action result into the translated toast text
// (`err.<code>`, with the action's params filled in).

import type { TFunction } from '@/i18n/translate';
import type { ActionResult } from '@/server/result';

export function actionErrorMessage(t: TFunction, res: ActionResult<unknown>): string {
  if (res.ok) return '';
  const key = `err.${res.error}`;
  const text = t(key, res.params);
  return text === key ? t('err.generic') : text;
}
