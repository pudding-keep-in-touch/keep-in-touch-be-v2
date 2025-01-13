import appConfig from './app/app-config';
import googleConfig from './google/google-config';
import jwtConfig from './jwt/jwt-config';
import kakaoConfig from './kakao/kakao-config';
import postgresConfig from './postgres/postgres-config';
import swaggerStatsConfig from './swagger-stats/swagger-stats-config';

export const loadConfigs = [appConfig, googleConfig, jwtConfig, kakaoConfig, postgresConfig, swaggerStatsConfig];
