import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Youtube_Content {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  youtube_id: string;
  @Column()
  title: string;
  @Column({ type: 'text', charset: 'utf8mb4' })
  description: string;
  @Column({ length: 500 })
  thumbnails: string;
  @Column()
  youtube_channel_id: string;
}
