import App from '@/App.vue'
import { msal, MsalConfiguration } from '@/plugins/msal-plugin';
import { createPinia } from 'pinia'
import { createApp } from 'vue'

const msalConfig: MsalConfiguration = {
  clientId: process.env.VUE_APP_OAUTH_CLIENT_ID,
  tenantId: process.env.VUE_APP_AZURE_B2C_TENANT,
  redirectUri: process.env.VUE_APP_AZURE_B2C_REDIRECT,
  scopeNames: ['full']
}
const app = createApp(App);
app
  .use(createPinia())
  .use(msal, msalConfig)
  .mount('#app');