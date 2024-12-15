export interface OIDCConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  authorizationEndpoint: string; // code 요청
  tokenEndpoint: string; // token 요청
  scope: string;
  validIssuers: string[];
}
