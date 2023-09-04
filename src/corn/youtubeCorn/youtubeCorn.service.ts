import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { forEachPromise, slip } from 'src/common/common.dto';
import { Youtube_Channel_Mapping } from 'src/entity/youtube_channel_mapping.entity';
import { Youtube_Content } from 'src/entity/youtube_content.entity';
import { WordpressService } from 'src/module/wordpress/wordpress.service';
import { YoutubeService } from 'src/module/youtube/youtube.service';
import { Repository } from 'typeorm';
import { CreateYoutubeContentDto } from './dto/youtubeContent.dto';
import { YoutubeDetailDto, YoutubeDetailVideoDto } from 'src/module/youtube/dto/youtube.dto';
import { SharpService } from 'src/module/sharp/sharp.service';
import moment from 'moment';
import { Cron } from '@nestjs/schedule';
import { OnEvent } from '@nestjs/event-emitter';
import { Event } from 'src/common/event.enum';
import { SwitService } from 'src/module/swit/swit.service';

@Injectable()
export class YoutubeCornService {
  constructor(
    @InjectRepository(Youtube_Channel_Mapping)
    private repository: Repository<Youtube_Channel_Mapping>,
    @InjectRepository(Youtube_Content)
    private conRepository: Repository<Youtube_Content>,
    private youtube: YoutubeService,
    private wp: WordpressService,
    private sharp: SharpService,
    private swit: SwitService,
  ) {}

  @OnEvent(Event.CRON_START)
  @Cron('0 0 10 * * *', { timeZone: 'Asia/Seoul' })
  private async getChannel() {
    const data = await this.repository.find();
    const result = await this.cronChannel(data);
    let errResult: (string | number)[] | undefined = undefined;
    const isErr = result.filter(k => isNaN(Number(k)));
    if (isErr.length) {
      const reData = result
        .map((v, i) => (isNaN(Number(v)) ? data[i] : false))
        .filter(v => v) as Youtube_Channel_Mapping[];
      await slip(60000);
      errResult = await forEachPromise(reData, this.cronOne.bind(this));
    }
    let errIndex = 0;
    const fResult = result.map(v =>
      isNaN(Number(v)) ? (errResult !== undefined ? errResult[errIndex++] : v) : v,
    );
    this.swit.message(
      `result : \n${fResult.map((v, i) => `${data[i].channel_name} : ${v}`).join('\n')}`,
    );
    return result;
  }

  private async cronChannel(data: Youtube_Channel_Mapping[]) {
    return await forEachPromise(data, this.cronOne.bind(this));
  }

  /**
   * 초기 워드프레스 접속
   * @param option
   * @returns
   */
  private async init(option: Youtube_Channel_Mapping) {
    const op = {
      endpoint: option.channel_endpoint,
      username: option.channel_username,
      password: option.channel_password,
    };
    await this.wp.initialize(op);
    let category = await this.wp.category(option.category_slug);
    let auth = await this.wp.auth(option.auth);
    if (category !== false && auth !== false) {
      return { category: category[0].id, auth: auth[0].id };
    }
    this.wp.reset(op);
    await slip(1000);
    await this.wp.initialize(op);
    category = await this.wp.category(option.category_slug);
    auth = await this.wp.auth(option.auth);
    if (category !== false && auth !== false) {
      return { category: category[0].id, auth: auth[0].id };
    }
    this.wp.reset(op);
    /**
     * 워드프레스 접속 불가시 상태 처리
     */
    return false;
  }

  private async cronOne(i: Youtube_Channel_Mapping) {
    // try {
    console.log(`${i.channel_name} ${i.channel_endpoint} start cron`);
    const init = await this.init(i);
    if (init !== false) {
      const search = await this.youtubeSearch(i.youtube_channel_id);
      if (search !== false) {
        const ks = moment(i.created_at).startOf('hour');
        const searchIn = search.filter(k => ks.diff(k.publishedAt, 'day') < 0);
        const has = await this.hasAll(searchIn.map(k => k.youtube_id));
        const insert: Array<CreateYoutubeContentDto> = [];
        searchIn.forEach(k => {
          if (has.findIndex(h => h.youtube_id === k.youtube_id) === -1) {
            insert.push(k);
          }
        });
        if (insert.length > 0) {
          const detail = await this.youtubeDetails(insert.map(k => k.youtube_id));
          if (detail !== false) {
            const items = await forEachPromise(insert, async item => {
              item.of(
                detail.items.find(d => YoutubeDetailVideoDto.youtubeId(d.id) === item.youtube_id),
              );
              const th = await this.thumbnail(item.thumbnails);
              if (th !== false) {
                item.thumbnails_buffer = th;
                const po = await this.wp.addContent({
                  option: i,
                  dto: item,
                  category: init.category,
                  auth: init.auth,
                });
                if (po !== false) {
                  this.createYoutube(item);
                } else {
                  this.swit.message(`content insert error : ${i.channel_name} ${item.youtube_id}`);
                }
              }
              return item;
            });
            return items.length;
          } else {
            // this.swit.message(`detail error : ${i.channel_name}`);
            return `detail error : ${i.channel_name}`;
          }
        } else {
          // 추가될 컨텐츠 존재 하지 않음
          return 0;
        }
      } else {
        // this.swit.message(`search error : ${i.channel_name}`);
        return `search error : ${i.channel_name}`;
      }
    } else {
      // this.swit.message(`init error : ${i.channel_name}`);
      return `init error : ${i.channel_name}`;
    }
    // } catch (err) {
    //   return `err ${i.channel_name}`;
    // }
  }

  /**
   * 유투브 api 검색 처리
   * @param channel
   * @returns
   */
  private async youtubeSearch(channel: string) {
    try {
      const data = await this.youtube.getSearch(channel);
      if (data !== undefined && !(data instanceof Error)) {
        return data.items.map(k => CreateYoutubeContentDto.of(k));
      }
      /**
       * 유투브 api 접속 불가시 상태 처리
       */
      return false;
    } catch (err) {
      return false;
    }
  }

  /**
   * 유투브 api 상세 처리
   * @param channel
   * @returns
   */
  private async youtubeDetails(insert: Array<string>) {
    try {
      const detail = await this.youtube.getDetail(insert);
      if (detail !== undefined && !(detail instanceof Error)) {
        return detail;
      }
      console.log('details error');
      /**
       * 유투브 api 접속 불가시 상태 처리
       */
      return false;
    } catch (err) {
      if (err instanceof Error) {
        console.log('details error');
        return false;
      } else {
        return err as YoutubeDetailDto;
      }
    }
  }

  private async thumbnail(url: string) {
    const th = await this.sharp.urlToBuffer(url);
    if (th !== false && th !== undefined) {
      return th;
    }
    console.log('thumbnail error');
    /**
     * 썸네일 제작 실패시 상태 처리
     */
    return false;
  }

  private async hasAll(ids: Array<string>) {
    try {
      if (ids.length) {
        const qb = this.conRepository.createQueryBuilder('y');
        qb.andWhere('y.youtube_id IN (:...ids)', { ids: ids });
        return await qb.getMany();
      } else {
        return [];
      }
    } catch (err) {
      console.log('sql content error');
      return [];
    }
  }

  private async createYoutube(dto: CreateYoutubeContentDto) {
    const d = await this.conRepository.save(dto.db());
    return d;
  }
}
