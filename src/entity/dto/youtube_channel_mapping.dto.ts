import { OmitType } from '@nestjs/swagger';
import { Youtube_Channel_Mapping } from '../youtube_channel_mapping.entity';

export class CreateYoutubeChannelMappingParam {
  readonly channel_name: string;
  readonly channel_endpoint: string;
  readonly channel_username: string;
  readonly channel_password: string;
  readonly display_name: string;
  readonly category_slug: string;
  readonly youtube_channel_id: string;
  readonly youtube_channel_name: string;
  readonly auth: string;
}

export class CreateYoutubeChannelMappingDto extends OmitType(Youtube_Channel_Mapping, ['id']) {
  constructor(v: CreateYoutubeChannelMappingParam) {
    super();
    this.channel_name = v.channel_name;
    this.channel_endpoint = v.channel_endpoint;
    this.channel_username = v.channel_username;
    this.channel_password = v.channel_password;
    this.category_slug = v.category_slug;
    this.platform_name = v.display_name;
    this.youtube_channel_id = v.youtube_channel_id;
    this.youtube_channel_name = v.youtube_channel_name;
    this.auth = v.auth;
  }

  static of(v: CreateYoutubeChannelMappingParam) {
    return new CreateYoutubeChannelMappingDto(v);
  }
}
