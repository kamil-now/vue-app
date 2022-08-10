import {
  AccountInfo,
  AuthenticationResult,
  PublicClientApplication,
  RedirectRequest,
} from "@azure/msal-browser";
import axios from "axios";
import { App, Plugin } from "vue";

export const MSAL = Symbol();

export type MsalConfiguration = {
  tenantId: string;
  clientId: string;
  redirectUri: string;
  scopeNames: string[];
};

export const msal: Plugin = {
  async install(app: App, options: MsalConfiguration) {
    const service = new MsalAuthService(options);
    const accessToken = await service.signIn();
    app.provide(MSAL, service);

    axios.interceptors.request.use(
      (config) => {
        if (!config.headers) {
          config.headers = {};
        }
        config.headers["Authorization"] = "Bearer " + accessToken;

        config.headers["Content-Type"] = "application/json";
        return config;
      },
      (error) => Promise.reject(error)
    );
  },
};

export class MsalAuthService {
  get activeAccount(): AccountInfo | null {
    return this.msal.getActiveAccount();
  }

  private readonly msal: PublicClientApplication;
  private readonly redirectRequest: RedirectRequest;

  constructor(config: MsalConfiguration) {
    this.msal = new PublicClientApplication({
      auth: {
        clientId: config.clientId,
        authority: `https://login.microsoftonline.com/${config.tenantId}`,
        knownAuthorities: [`${config.tenantId}.b2clogin.com`],
        redirectUri: config.redirectUri,
        navigateToLoginRequestUrl: false,
        postLogoutRedirectUri: config.redirectUri,
      },
      cache: {
        cacheLocation: "localStorage",
        storeAuthStateInCookie: true,
      },
    });
    this.redirectRequest = {
      scopes: config.scopeNames.map(
        (scope) => `api://${config.clientId}/${scope}`
      ),
    };
  }

  async signIn(): Promise<string> {
    const authenticationResult = await this.handleLoginRedirect().catch(
      async () => {
        await this.msal.loginRedirect(this.redirectRequest);
        return null;
      }
    );
    if (authenticationResult) {
      console.warn("Logged in as ", this.activeAccount?.username);
      return authenticationResult.accessToken;
    }
    throw new Error("Invalid authentication result");
  }

  private handleLoginRedirect(): Promise<AuthenticationResult> {
    return new Promise((resolve, reject) => {
      this.msal.handleRedirectPromise().then(() => {
        const accounts = this.msal.getAllAccounts();

        if (accounts.length > 0) {
          this.msal.setActiveAccount(accounts[0]);

          const request = {
            ...this.redirectRequest,
            account: accounts[0],
          };

          this.msal
            .acquireTokenSilent(request)
            .then((tokenResponse: AuthenticationResult) => {
              resolve(tokenResponse);
            })
            .catch((e: Error) => {
              reject(e);
            });
        } else {
          reject(new Error("no accounts found"));
        }
      });
    });
  }
}
