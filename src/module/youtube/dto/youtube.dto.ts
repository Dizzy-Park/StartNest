abstract class AbsYoutubeDto {
  readonly kind: string;
  readonly etag: string;
  readonly nextPageToken: string;
  readonly regionCode: string;
  readonly pageInfo: { readonly totalResults: number; readonly resultsPerPage: number };
}

export class YoutubeSearchDto extends AbsYoutubeDto {
  readonly items: Array<YoutubeSearchVideoDto>;
}

export class YoutubeDetailDto extends AbsYoutubeDto {
  readonly items: Array<YoutubeDetailVideoDto>;
}

type YoutubeIdDto =
  | {
      readonly kind: string;
      readonly videoId: string;
    }
  | string;

abstract class YoutubeVideoDto {
  readonly kind: string;
  readonly etag: string;
  readonly id: YoutubeIdDto;
}

class SnippetDto {
  readonly publishedAt: string;
  readonly channelId: string;
  readonly title: string;
  readonly description: string;
  readonly thumbnails: {
    readonly default: ThumbnailDto;
    readonly medium: ThumbnailDto;
    readonly high: ThumbnailDto;
    readonly standard: ThumbnailDto;
    readonly maxres: ThumbnailDto;
  };
  readonly channelTitle: string;
  readonly tags: Array<string>;
  readonly categoryId: string;
  readonly liveBroadcastContent: string;
  readonly localized: {
    readonly title: string;
    readonly description: string;
  };
  readonly defaultAudioLanguage: string;
}

class ThumbnailDto {
  readonly url: string;
  readonly width: number;
  readonly height: number;
}

// class StatisticsDto {
//   readonly viewCount: string;
//   readonly likeCount: string;
//   readonly favoriteCount: string;
//   readonly commentCount: string;
// }

export class YoutubeSearchVideoDto extends YoutubeVideoDto {
  readonly snippet?: SnippetDto;

  static youtubeId(id: YoutubeIdDto) {
    return youtubeId(id);
  }
}

export class YoutubeDetailVideoDto extends YoutubeVideoDto {
  // readonly statistics?: StatisticsDto;
  readonly snippet?: SnippetDto;

  static youtubeId(id: YoutubeIdDto) {
    return youtubeId(id);
  }
}

function youtubeId(id: YoutubeIdDto) {
  return typeof id === 'string' ? id : id.videoId;
}
