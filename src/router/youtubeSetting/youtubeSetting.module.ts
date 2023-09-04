import { Module } from '@nestjs/common';
import { YoutubeSettingService } from './youtubeSetting.service';
import { YoutubeSettingController } from './youtubeSetting.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Youtube_Channel_Mapping } from 'src/entity/youtube_channel_mapping.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Youtube_Channel_Mapping])],
  controllers: [YoutubeSettingController],
  providers: [YoutubeSettingService],
})
export class YoutubeSettingModule {}
