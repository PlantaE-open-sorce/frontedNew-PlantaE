import { Pipe, PipeTransform, inject } from '@angular/core';
import { I18nService } from '../../infrastructure/services/i18n.service';

@Pipe({
    name: 'localizedDate',
    standalone: true,
    pure: false
})
export class LocalizedDatePipe implements PipeTransform {
    private readonly i18n = inject(I18nService);

    transform(value: Date | string | number | null | undefined, options?: Intl.DateTimeFormatOptions): string {
        if (!value) return '';

        const date = new Date(value);
        const lang = this.i18n.currentLanguage(); //

        const defaultOptions: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };

        try {
            const formatted = new Intl.DateTimeFormat(lang, options ?? defaultOptions).format(date).trim();
            return formatted.charAt(0).toUpperCase() + formatted.slice(1);
        } catch (e) {
            console.warn('LocalizedDatePipe error', e);
            return date.toLocaleDateString();
        }
    }
}
