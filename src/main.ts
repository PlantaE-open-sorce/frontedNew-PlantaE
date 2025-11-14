import { bootstrapApplication, Title } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, {
  ...appConfig,
  providers: [...(appConfig.providers ?? []), Title]
})
  .catch((err) => console.error(err));
