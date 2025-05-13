import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { MsalBroadcastService, MsalModule, MsalService } from '@azure/msal-angular';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { ServiceWorkerModule } from '@angular/service-worker';

describe('AppComponent', () => {
  const mockMsalInstance = new PublicClientApplication({
    auth: {
      clientId: 'mock-client-id', // Replace with actual or mock
      redirectUri: '/',
    },
  });
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        AppComponent,
        ServiceWorkerModule.register('', { enabled: false }),
        MsalModule.forRoot(
          mockMsalInstance,
          {
            interactionType: InteractionType.Redirect,
            authRequest: {
              scopes: ['user.read'],
            },
          },
          {
            interactionType: InteractionType.Redirect,
            protectedResourceMap: new Map(),
          },
        ),
      ],
      providers: [MsalService, MsalBroadcastService],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
