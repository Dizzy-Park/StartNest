import { Injectable } from '@nestjs/common';
import WPAPI from 'wpapi';
import {
  WPCategoryList,
  WPCreateContentDto,
  WPItem,
  WPMedia,
  WPMediaList,
  WPPost,
  WPPostList,
  WPTags,
  WPUserList,
} from './dto/wordpress.dto';
import { CreateYoutubeContentDto } from 'src/corn/youtubeCorn/dto/youtubeContent.dto';
import { forEachPromise } from 'src/common/common.dto';
import { SwitService } from '../swit/swit.service';
import { Youtube_Channel_Mapping } from 'src/entity/youtube_channel_mapping.entity';

const wpCash: { [key: string]: WPAPI } = {};

@Injectable()
export class WordpressService {
  private _wp: WPAPI | undefined;
  private _tags: { [key: string]: WPItem } = {};

  constructor(private swit: SwitService) {}

  get wp() {
    return this._wp!;
  }

  async initialize(options: { endpoint: string; username: string; password: string }) {
    // try {
    //   this._wp = new WPAPI(options);
    // } catch (err) {
    this._wp = undefined;
    this._tags = {};
    if (wpCash[options.endpoint] === undefined) {
      try {
        this._wp = await WPAPI.discover(options.endpoint);
        this.wp.auth({
          username: options.username,
          password: options.password,
        });
        wpCash[options.endpoint] = this._wp;
      } catch (err) {
        console.log(err);
        try {
          this._wp = new WPAPI(options);
          console.log(`${options.endpoint}/wp-json/`);
          this._wp.url(`${options.endpoint}/wp-json/`);
          wpCash[options.endpoint] = this._wp;
        } catch (err) {
          console.log('initialize error');
        }
      }
    } else {
      this._wp = wpCash[options.endpoint];
    }
    // }
  }

  reset(options: { endpoint: string; username: string; password: string }) {
    delete wpCash[options.endpoint];
  }

  async addContent({
    option,
    dto,
    category,
    auth,
  }: {
    option: Youtube_Channel_Mapping;
    dto: CreateYoutubeContentDto;
    category: number;
    auth: number;
  }) {
    console.log(`create content ${dto.youtube_id}`);
    const p = await this.findPost(dto.youtube_id);
    if (p !== false) {
      if (p.length === 0) {
        const tags = await forEachPromise(dto.tags, async t => {
          const td = await this.hasTag(t.replace(/\#/gims, ''));
          if (td !== false) {
            return td.id;
          }
          return false;
        });
        const ctags = tags.filter(t => t !== false) as Array<number>;
        const image = await this.createThumbnail(dto.thumbnails_buffer, dto.youtube_id);
        if (image !== false) {
          const cd = await this.createPost({
            ...dto.post(),
            categories: [category],
            author: auth,
            tags: ctags,
            featured_media: image.id,
            post_meta: [{ key: '_thumbnail_id', value: image.id }],
          });
          if (cd !== false) {
            return cd.id;
          }
        }
      } else {
        return p[0].id;
      }
    }
    this.swit.message(`content error : ${option.channel_name} ${dto.youtube_id}`);
    console.log(`error content ${dto.youtube_id}`);
    return false;
  }

  async category(slug: string) {
    try {
      const data = (await this.wp
        .categories()
        .slug(slug)
        .param('_fields', ['id', 'name', 'slug'])) as WPCategoryList;
      if (data.length > 0) {
        return data;
      }
      return false;
    } catch (err) {
      console.log('category error');
      return false;
    }
  }

  async auth(name: string) {
    try {
      const data = (await this.wp
        .users()
        .search(name)
        .param('_fields', ['id', 'name', 'slug'])) as WPUserList;
      return data;
    } catch (err) {
      return false;
    }
  }

  private async createPost(dto: WPCreateContentDto) {
    try {
      const data = (await this.wp.posts().create(dto)) as WPPost;
      return data;
    } catch (err) {
      return false;
    }
  }

  private async findPost(slug: string) {
    try {
      const data = (await this.wp
        .posts()
        .param('status', ['any'])
        .param('_fields', ['id', 'title', 'slug'])
        .slug(slug)) as WPPostList;
      return data;
    } catch (err) {
      return false;
    }
  }

  private async createThumbnail(file: Buffer, name: string) {
    try {
      const img = await this.findMedia(`${name}_th`);
      if (img !== false) {
        if (img.length === 0) {
          const cimg = await this.createMedia(file, `${name}_th`);
          return cimg;
        } else {
          return img[0];
        }
      }
      return false;
    } catch (err) {
      console.log('createThumbnail error ' + name);
      return false;
    }
  }

  private async hasTag(name: string) {
    try {
      if (this._tags[name] === undefined) {
        const t = await this.findTag(name);
        if (t !== false) {
          if (t.length > 0) {
            this._tags[name] = t[0];
            return t[0];
          } else {
            const ct = await this.createTag(name);
            if (ct !== false) {
              this._tags[name] = ct;
              return ct;
            }
          }
        }
        return false;
      } else {
        return this._tags[name];
      }
    } catch (err) {
      return false;
    }
  }

  private async findTag(name: string) {
    try {
      const data = (await this.wp
        .tags()
        .slug(name)
        .param('_fields', ['id', 'name', 'slug'])) as WPTags;
      if (data.length > 0) {
        this._tags[name] = data[0];
      }
      return data;
    } catch (err) {
      return false;
    }
  }

  private async createTag(name: string) {
    try {
      const data = (await this.wp
        .tags()
        .param('_fields', ['id', 'name', 'slug'])
        .create({ name: name })) as WPItem;
      return data;
    } catch (err) {
      return false;
    }
  }

  private async createMedia(file: Buffer, name: string) {
    try {
      const img = (await this.wp
        .media()
        .file(file as any, name + '.jpg')
        .param('_fields', ['id', 'source_url', 'slug'])
        .create({ slug: name })) as WPMedia;
      return img;
    } catch (err) {
      console.log('createMedia error ' + name);
      return false;
    }
  }

  private async findMedia(slug: string) {
    try {
      const img = (await this.wp
        .media()
        .slug(slug)
        .order('desc')
        .param('_fields', ['id', 'source_url', 'slug'])) as WPMediaList;
      return img;
    } catch (err) {
      return false;
    }
  }
}
