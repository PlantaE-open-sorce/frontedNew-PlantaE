import { Injectable, signal } from '@angular/core';

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

  readonly messages = this.messagesState.asReadonly();

  success(text: string) {
    this.push('success', text);
  }

  error(text: string) {
    this.push('error', text);
  }

  info(text: string) {
    this.push('info', text);
  }

  remove(id: number) {
    this.messagesState.update((messages) => messages.filter((msg) => msg.id !== id));
  }

  private push(type: ToastType, text: string) {
    const toast: ToastMessage = { id: ++this.counter, type, text };
    this.messagesState.update((messages) => [...messages, toast]);
    setTimeout(() => this.remove(toast.id), 5000);
  }
}
