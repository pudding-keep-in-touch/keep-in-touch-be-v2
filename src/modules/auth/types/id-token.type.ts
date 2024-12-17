export type IdTokenType = GoogleIdTokenType | KakaoIdTokenType;

/**
 * Google에서 제공하는 ID token 타입
 * @see https://developers.google.com/identity/openid-connect/openid-connect?hl=ko#an-id-tokens-payload
 */
export type GoogleIdTokenType = {
  //NOTE: 필수값

  /**
   * ID 토큰 발급자
   * 항상 'https://accounts.google.com' 또는 'accounts.google.com' 값을 가짐
   */
  iss: string;

  /**
   * ID 토큰의 대상 OAuth 2.0 클라이언트 ID
   * 반드시 애플리케이션의 OAuth 2.0 클라이언트 ID 중 하나여야 함
   */
  aud: string;

  /**
   * 사용자의 고유 식별자. 모든 Google 계정에서 고유하며, 재사용되지 않음.
   * 최대 255자의 대소문자를 구분하는 ASCII
   */
  sub: string;

  /**
   * ID 토큰 발급 시각, Unix timestamp
   */
  iat: number;

  /**
   * ID 토큰 만료 시각, Unix timestamp
   */
  exp: number;

  // NOTE: 선택값, keep in touch에서 사용함
  /**
   * 인증된 발표자의 client_id
   * 토큰 요청 당사자와 토큰 대상이 다를 때 필요함.
   * 예: 웹앱과 안드로이드 앱이 다른 OAuth 2.0 client_id를 가지지만 동일한 Google API 프로젝트를 공유하는 경우
   */
  azp?: string;

  /**
   * 사용자의 이메일 주소
   * email scope가 요청에 포함된 경우에만 포함된다.
   * 식별자로 사용하면 안됨. 어쩌지?ㅎㅎ
   */
  email?: string;

  /**
   * 이메일 주소가 인증되었는지 여부
   */
  email_verified?: boolean;

  /**
   * 액세스 토큰의 해시값
   */
  at_hash?: string;

  /**
   * 사용자 전체 이름
   * profile 스코프 요청 시 제공
   */
  name?: string;

  /**
   * 사용자 프로필 사진 UR용
   * profile 스코프 요청 시 제공
   */
  picture?: string;

  /**
   * 사용자의 이름 (성 제외)
   * name 클레임 존재 시 제공
   */
  given_name?: string;

  /**
   * 사용자의 성
   * name 클레임 존재 시 제공
   */
  family_name?: string;

  // NOTE: 선택값, keep in touch에서 사용하지 않음
  /**
   * 인증 요청 시 앱에서 제공한 nonce 값
   * 재생 공격 방지를 위해 한 번만 사용
   */
  nonce?: string;

  /**
   * 사용자의 프로필 페이지 URL
   * profile 스코프 요청 시 제공
   */
  profile?: string;

  /**
   * 사용자가 속한 Google Workspace 혹은 Cloud organization 도메인
   * 사용자가 Google Cloud organization에 속한 경우에만 제공
   */
  hd?: string;

  /**
   * 사용자의 지역, name 클레임 존재 시 제공될 수 있음.
   * BCP 47 형식
   */
  locale?: string;
};

/**
 * kakao ID token 타입
 * @see https://developers.kakao.com/docs/latest/ko/kakaologin/rest-api#request-token-response-id-token
 */
export type KakaoIdTokenType = {
  // NOTE: 필수값
  /**
   * id 토큰 발급 기관 인증 정보
   * https://kauth.kakao.com로 고정
   */
  iss: string;

  /**
   * ID 토큰이 발급된 앱의 앱 키
   * 인가 코드 받기 요청 시 client_id에 전달된 앱 키
   */
  aud: string;

  /**
   * ID 토큰에 해당하는 사용자 회원번호
   */
  sub: string;

  /**
   * ID 토큰 발급 또는 갱신 시각, unix timestamp
   */
  iat: number;

  /**
   * ID 토큰 만료 시각, unix timestamp
   */
  exp: number;

  /**
   * 사용자가 카카오 로그인을 통해 인증을 완료한 시각, unix timestamp
   */
  auth_time: number;

  // NOTE: 선택값. keep in touch에서 사용함.
  /**
   * 닉네임
   * kakao_account.profile.nickname
   * 프로필정보, 혹은 닉네임 동의 필요
   */
  nickname?: string;

  /**
   * 카카오 계정 대표 이매알
   * kakao_account.email
   * 유효하고 인증된 이메일 값이 있는 경우에만 제공.
   */
  email?: string;

  // NOTE: 선택값 , keep in touch에서 사용하지 않음.
  /**
   * 프로필 미리보기 이미지 URL
   * kakao_account.profile.thumbnail_image_url
   * 프로필정보, 혹은 프로필 사진 동의 필요
   */
  picture?: string;

  /**
   * 인가 코드 받기 요청 시 전달한 nonce값과 동일한 값
   */
  nonce?: string;
};
