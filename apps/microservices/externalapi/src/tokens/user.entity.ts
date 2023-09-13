import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Token } from './token.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  email: string;

  @OneToMany(() => Token, (token) => token.user)
  tokens: Token[];

}
