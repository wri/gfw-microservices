import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity({ name: 'Users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'middle_initial' })
  middleInitial: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  email: string;

  @Column({ name: 'phone' })
  phone: string;

  @Column({ name: 'title_id' })
  titleId: number;

  @Column({ name: 'other_title' })
  otherTitle: string;

  @Column({ name: 'access_level_id' })
  accessLevelId: number;

  @Column({ name: 'status_id' })
  statusId: number;

  @Column({ name: 'activated_time' })
  activatedTime: string;

  @Column({ name: 'email_subscription' })
  emailSubscription: number;

  @Column({ name: 'is_system_user' })
  isSystemUser: number;

  @Column({ name: 'initial_login' })
  initialLogin: string;

  @Column({ name: 'viirs_email_frequency' })
  viirsEmailFrequency: number;

  @Column({ name: 'glad_email_frequency' })
  gladEmailFrequency: number;

  @Column({ name: 'forma_email_frequency' })
  formaEmailFrequency: number;

  @Column({ name: 'terrai_email_frequency' })
  terraiEmailFrequency: number;

  @Column({ name: 'gran_chaco_email_frequency' })
  granChacoEmailFrequency: number;
}
