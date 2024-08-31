import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@entities/user.entity';
// import { User } from '@modules/users/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    async validateUser(user: any): Promise<User> {
        let existingUser = await this.userRepository.findOne({
            where: { email: user.email },
        });

        if (!existingUser) {
            existingUser = this.userRepository.create({
                email: user.email,
                status: 1,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
            await this.userRepository.save(existingUser);
        }

        return existingUser;
    }
}
