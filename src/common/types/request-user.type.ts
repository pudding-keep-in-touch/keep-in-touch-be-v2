import { User } from '@entities/user.entity';
import { Request } from 'express';

export type RequestUser = Request & { user: User };
