import { Module } from '@nestjs/common';
import { YoutubeCornService } from './youtubeCorn.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Youtube_Channel_Mapping } from 'src/entity/youtube_channel_mapping.entity';
import { YoutubeModule } from 'src/module/youtube/youtube.module';
import { WordpressModule } from 'src/module/wordpress/wordpress.module';
import { Youtube_Content } from 'src/entity/youtube_content.entity';
import { SharpModule } from 'src/module/sharp/sharp.module';
import { SwitModule } from 'src/module/swit/swit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Youtube_Channel_Mapping, Youtube_Content]),
    YoutubeModule.register({ key: 'AIzaSyD_7Shw4BF4Aqk2VqsyKojCqEp7q9YwzLE' }),
    WordpressModule.register({}),
    SharpModule.register({}),
    SwitModule.register({}),
  ],
  providers: [YoutubeCornService],
})
export class YoutubeCornModule {}
