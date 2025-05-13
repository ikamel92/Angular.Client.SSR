import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';
import {
  MSAL_GUARD_CONFIG,
  MSAL_INSTANCE,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalGuardConfiguration,
  MsalInterceptor,
  MsalInterceptorConfiguration,
  MsalService,
} from '@azure/msal-angular';
import { BrowserCacheLocation, InteractionType, IPublicClientApplication, LogLevel, PublicClientApplication } from '@azure/msal-browser';
import appConfig from '../../public/assets/appConfig.json';
import { IAppConfig } from './models/app-config.model';
export function instanceFactory(): IPublicClientApplication {
  const msalConfig = (appConfig as IAppConfig).authContextConfig;
  return new PublicClientApplication({
    auth: {
      clientId: msalConfig.clientId,
      authority: msalConfig.instance + msalConfig.tenant,
      redirectUri: '/',
    },
    cache: {
      cacheLocation: BrowserCacheLocation.LocalStorage,
    },
    system: {
      loggerOptions: {
        logLevel: LogLevel.Warning,
        piiLoggingEnabled: false,
      },
    },
  });
}

export function interceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, string[]>();
  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}

export function guardConfigFactory(): MsalGuardConfiguration {
  const msalApplicationConfigScopes = (appConfig as IAppConfig).msalApplicationConfigScopes;
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: msalApplicationConfigScopes,
    },
    loginFailedRoute: '/login-failed',
  };
}

export const MSAL_PROVIDERS: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: MsalInterceptor,
    multi: true,
  },
  {
    provide: MSAL_INSTANCE,
    useFactory: instanceFactory,
  },
  {
    provide: MSAL_GUARD_CONFIG,
    useFactory: guardConfigFactory,
  },
  {
    provide: MSAL_INTERCEPTOR_CONFIG,
    useFactory: interceptorConfigFactory,
  },
  MsalService,
  MsalGuard,
  MsalBroadcastService,
];
