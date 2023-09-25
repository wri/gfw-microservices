import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ExternalAPIKey } from './external-api-key.entity';

@Entity({ name: 'Users' })
export class User {
  @PrimaryColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  email: string;

  @OneToMany(() => ExternalAPIKey, (token) => token.user)
  tokens: ExternalAPIKey[];
}
