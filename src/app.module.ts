import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { YoutubeCornModule } from './corn/youtubeCorn/youtubeCorn.module';
import { typeOrmModuleOptions } from './data-source';
import { YoutubeSettingModule } from './router/youtubeSetting/youtubeSetting.module';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV === 'dev' ? '.env.development' : '.env.production',
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRoot(typeOrmModuleOptions),
    YoutubeCornModule,
    YoutubeSettingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
