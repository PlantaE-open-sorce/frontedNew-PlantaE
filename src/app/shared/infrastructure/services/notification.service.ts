import { Injectable, signal } from '@angular/core';
import { I18nService } from './i18n.service';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  type: ToastType;
  text: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly messagesState = signal<ToastMessage[]>([]);
  private counter = 0;
  constructor(private readonly i18n: I18nService) {}

  readonly messages = this.messagesState.asReadonly();

  success(text: string) {
    this.push('success', this.translate(text));
  }

  error(text: string) {
    this.push('error', this.translate(text));
  }

  info(text: string) {
    this.push('info', this.translate(text));
  }

  remove(id: number) {
    this.messagesState.update((messages) => messages.filter((msg) => msg.id !== id));
  }

  private push(type: ToastType, text: string) {
    const toast: ToastMessage = { id: ++this.counter, type, text };
    this.messagesState.update((messages) => [...messages, toast]);
    setTimeout(() => this.remove(toast.id), 5000);
  }

  private translate(text: string) {
    if (text.includes(':')) {
      return this.i18n.translate(text, text);
    }
    return text;
  }
}
