import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SwUpdate } from '@angular/service-worker';
import {
  MSAL_GUARD_CONFIG,
  MsalBroadcastService,
  MsalGuardConfiguration,
  MsalService,
} from '@azure/msal-angular';
import {
  EventMessage,
  EventType,
  InteractionStatus,
  PopupRequest,
  RedirectRequest,
} from '@azure/msal-browser';
import { filter, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'codex-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  loginDisplay = signal(false);
  private readonly destroying$ = new Subject<void>();
  private readonly authService = inject(MsalService);
  private readonly msalBroadcastService = inject(MsalBroadcastService);
  private readonly msalGuardConfig = inject<MsalGuardConfiguration>(MSAL_GUARD_CONFIG);
  private readonly swUpdate = inject(SwUpdate);

  constructor() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates.pipe(takeUntil(this.destroying$)).subscribe({
        next: (event) => {
          if (event.type === 'VERSION_READY') {
            if (confirm('New version available. Load new version?')) {
              window.location.reload();
            }
          }
        },
        error: (err) => console.error('Error occurred:', err),
      });
    }
  }

  ngOnInit(): void {
    this.authService.handleRedirectObservable().pipe(takeUntil(this.destroying$)).subscribe();

    this.setLoginDisplay();

    // Enabling ACCOUNT_ADDED and ACCOUNT_REMOVED events emitted when a user logs in or out of another tab or window
    this.authService.instance.enableAccountStorageEvents();
    this.msalBroadcastService.msalSubject$
      .pipe(
        filter(
          (msg: EventMessage) =>
            msg.eventType === EventType.ACCOUNT_ADDED ||
            msg.eventType === EventType.ACCOUNT_REMOVED,
        ),
        takeUntil(this.destroying$),
      )
      .subscribe({
        next: () => {
          if (this.authService.instance.getAllAccounts().length === 0) {
            window.location.pathname = '/';
          } else {
            this.setLoginDisplay();
          }
        },
        error: (err) => console.error('Error occurred:', err),
      });

    this.msalBroadcastService.inProgress$
      .pipe(
        filter((status: InteractionStatus) => status === InteractionStatus.None),
        takeUntil(this.destroying$),
      )
      .subscribe({
        next: () => {
          this.setLoginDisplay();
          this.checkAndSetActiveAccount();
        },
        error: (err) => console.error('Error occurred:', err),
      });
  }

  setLoginDisplay(): void {
    this.loginDisplay.set(this.authService.instance.getAllAccounts().length > 0);
  }

  checkAndSetActiveAccount(): void {
    /**
     * If no active account set but there are accounts signed in, sets first account to active account
     * To use active account set here, subscribe to inProgress$ first in your component
     * Note: Basic usage demonstrated. Your app may require more complicated account selection logic
     */
    const activeAccount = this.authService.instance.getActiveAccount();

    if (!activeAccount && this.authService.instance.getAllAccounts().length > 0) {
      const accounts = this.authService.instance.getAllAccounts();
      this.authService.instance.setActiveAccount(accounts[0]);
    }
  }

  loginRedirect(): void {
    let request: RedirectRequest | undefined;
    if (this.msalGuardConfig.authRequest) {
      request = { ...this.msalGuardConfig.authRequest } as RedirectRequest;
    }
    this.authService
      .loginRedirect(request)
      .pipe(takeUntil(this.destroying$))
      .subscribe({
        next: () => {
          console.error('Redirect callback');
        },
        error: (err) => console.error('Error occurred:', err),
      });
  }

  loginPopup(): void {
    if (this.msalGuardConfig.authRequest) {
      this.authService
        .loginPopup({ ...this.msalGuardConfig.authRequest } as PopupRequest)
        .pipe(takeUntil(this.destroying$))
        .subscribe({
          next: (response) => this.authService.instance.setActiveAccount(response.account),
          error: (err) => console.error('Error occurred:', err),
        });
    } else {
      this.authService
        .loginPopup()
        .pipe(takeUntil(this.destroying$))
        .subscribe({
          next: (response) => this.authService.instance.setActiveAccount(response.account),
          error: (err) => console.error('Error occurred:', err),
        });
    }
  }

  logout(popup?: boolean): void {
    if (popup) {
      this.authService.logoutPopup({
        mainWindowRedirectUri: '/',
      });
    } else {
      this.authService.logoutRedirect();
    }
  }

  ngOnDestroy(): void {
    this.destroying$.next(undefined);
    this.destroying$.complete();
  }
}
