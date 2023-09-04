import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IYoutubeOption } from './youtube.interface';

const youtubeExtendsModule = new ConfigurableModuleBuilder<IYoutubeOption>().build();

export const YoutubeExtendsClass = youtubeExtendsModule.ConfigurableModuleClass;
export const YOUTUBE_TOKEN = youtubeExtendsModule.MODULE_OPTIONS_TOKEN;
