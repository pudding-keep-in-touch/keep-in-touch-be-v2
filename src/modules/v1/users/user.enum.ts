export enum LoginType {
  EMAIL = 1,
  GOOGLE = 2,
  NAVER = 3,
  KAKAO = 4,
  // 필요에 따라 다른 로그인 타입을 추가할 수 있습니다.
}

// 유저 계정 상태
export enum UserStatus {
  NORMAL = 1, // 정상
  WITHDRAWN = 2, // 탈퇴
  DORMANT = 3, // 휴면
  SUSPENDED = 4, // 정지
}
