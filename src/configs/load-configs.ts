import appConfig from './app/app-config';
import googleConfig from './google/google-config';
import jwtConfig from './jwt/jwt-config';
import kakaoConfig from './kakao/kakao-config';
import postgresConfig from './postgres/postgres-config';

export const loadConfigs = [appConfig, googleConfig, jwtConfig, kakaoConfig, postgresConfig];
