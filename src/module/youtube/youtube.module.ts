import { Module } from '@nestjs/common';
import { YoutubeExtendsClass } from './youtube.module-definition';
import { YoutubeService } from './youtube.service';

@Module({ providers: [YoutubeService], exports: [YoutubeService] })
export class YoutubeModule extends YoutubeExtendsClass {}
