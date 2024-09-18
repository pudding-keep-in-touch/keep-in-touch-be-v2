import { Users } from '@entities/users.entity';

export class ResponseGoogleCallbackDto {
  accessToken: string;
  user: Partial<Users>;
}
