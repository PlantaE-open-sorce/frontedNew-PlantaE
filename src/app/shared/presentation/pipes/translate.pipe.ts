import { Pipe, PipeTransform } from '@angular/core';
import { I18nService } from '../../infrastructure/services/i18n.service';

@Pipe({
  name: 't',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  constructor(private readonly i18n: I18nService) { }

  transform(key: string, paramsOrFallback?: object | string): string {
    if (typeof paramsOrFallback === 'string') {
      return this.i18n.translate(key, paramsOrFallback);
    }
    return this.i18n.translate(key, undefined, paramsOrFallback);
  }
}
