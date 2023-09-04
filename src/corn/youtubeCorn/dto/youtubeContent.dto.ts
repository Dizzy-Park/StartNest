import { OmitType } from '@nestjs/swagger';
import { Youtube_Content } from 'src/entity/youtube_content.entity';
import { YoutubeDetailVideoDto, YoutubeSearchVideoDto } from 'src/module/youtube/dto/youtube.dto';

export class CreateYoutubeContentDto extends OmitType(Youtube_Content, ['id']) {
  tags: Array<string>;
  thumbnails_buffer: Buffer;
  publishedAt: string;

  static of(v: YoutubeSearchVideoDto) {
    const f = new CreateYoutubeContentDto();
    f.youtube_id = YoutubeSearchVideoDto.youtubeId(v.id);
    if (v.snippet) {
      f.youtube_channel_id = v.snippet?.channelId;
      f.title = v.snippet?.title;
      f.description = v.snippet?.description;
      f.thumbnails = v.snippet?.thumbnails.high.url;
      f.publishedAt = v.snippet?.publishedAt;
      f.tags = v.snippet?.tags;
    }
    return f;
  }

  of(v?: YoutubeDetailVideoDto) {
    if (v && v.snippet) {
      if (v.snippet.thumbnails.maxres) {
        this.thumbnails = v.snippet.thumbnails.maxres.url;
      } else if (v.snippet.thumbnails.standard) {
        this.thumbnails = v.snippet.thumbnails.standard.url;
      } else {
        this.thumbnails = v.snippet.thumbnails.high.url;
      }
      this.description = v.snippet.description;
      this.tags = v.snippet.tags;
      this.publishedAt = v.snippet.publishedAt;
    }
  }

  db() {
    return {
      youtube_id: this.youtube_id,
      youtube_channel_id: this.youtube_channel_id,
      title: this.title,
      description: this.description,
      thumbnails: this.thumbnails,
    };
  }

  post() {
    return {
      title: this.title,
      date: new Date(this.publishedAt),
      slug: this.youtube_id,
      content: `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${
        this.youtube_id
      }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe><p>${this.description.replace(
        /\n([0-1][0-9]|2[0-3]):[0-5][0-9]/gims,
        '',
      )}</p>`,
      //   status: 'pending',
      status: 'publish',
    };
  }
}
