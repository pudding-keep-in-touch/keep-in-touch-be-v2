import type { Request } from 'express';

export type SocialUserProfile = {
  sub: string; // sub
  email: string;
  nickname?: string;
};

export type RequestSocialUser = Request & { socialUser: SocialUserProfile };
