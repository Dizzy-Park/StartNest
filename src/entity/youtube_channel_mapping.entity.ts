import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Youtube_Channel_Mapping {
  @PrimaryGeneratedColumn()
  id: number;
  @CreateDateColumn()
  created_at: Date;
  @Column()
  channel_name: string;
  @Column()
  channel_endpoint: string;
  @Column()
  channel_username: string;
  @Column()
  channel_password: string;
  @Column()
  platform_name: string;
  @Column()
  category_slug: string;
  @Column()
  youtube_channel_id: string;
  @Column()
  youtube_channel_name: string;
  @Column()
  auth: string;
}
