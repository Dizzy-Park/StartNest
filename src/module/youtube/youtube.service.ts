import { Inject, Injectable } from '@nestjs/common';
import { YOUTUBE_TOKEN } from './youtube.module-definition';
import { IYoutubeOption } from './youtube.interface';
import { YoutubeDetailDto, YoutubeSearchDto } from './dto/youtube.dto';

// import json from './dto/youtubeData.json';
// import jsond from './dto/youtubeDetail.json';

import { YoutubeDataAPI } from 'youtube-v3-api';

@Injectable()
export class YoutubeService {
  private youtube;
  constructor(@Inject(YOUTUBE_TOKEN) options: IYoutubeOption) {
    this.youtube = new YoutubeDataAPI(options.key);
  }

  async getSearch(channel: string): Promise<YoutubeSearchDto | Error | undefined> {
    const search = (await this.youtube.searchAll('', 50, {
      part: 'snippet',
      regionCode: 'kr',
      type: 'video',
      order: 'date',
      channelId: channel,
    })) as YoutubeSearchDto;
    return search;
  }

  async getDetail(youtubeIds: Array<string>): Promise<YoutubeDetailDto | Error | undefined> {
    const detail = (await this.youtube.searchVideo(youtubeIds.join(','), {
      part: 'snippet',
    })) as YoutubeDetailDto;
    return detail;
  }
}
