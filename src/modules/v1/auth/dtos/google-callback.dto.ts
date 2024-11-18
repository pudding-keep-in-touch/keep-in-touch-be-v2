import { Users } from '@entities/v1/users.entity';

export class ResponseGoogleCallbackDto {
  accessToken: string;
  user: Partial<Users>;
}
