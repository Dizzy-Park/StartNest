import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { PageParam, ReturnList } from 'src/common/common.dto';
import { Event } from 'src/common/event.enum';
import {
  CreateYoutubeChannelMappingDto,
  CreateYoutubeChannelMappingParam,
} from 'src/entity/dto/youtube_channel_mapping.dto';
import { Youtube_Channel_Mapping } from 'src/entity/youtube_channel_mapping.entity';
import { Repository } from 'typeorm';

@Injectable()
export class YoutubeSettingService {
  constructor(
    @InjectRepository(Youtube_Channel_Mapping)
    private repository: Repository<Youtube_Channel_Mapping>,
    private event: EventEmitter2,
  ) {}

  async findAll(params: PageParam) {
    return ReturnList.of(
      await this.repository.find({ skip: params.page! - 1, take: params.size }),
      params.page!,
      params.size!,
      await this.repository.count(),
    );
  }

  async createOne(params: CreateYoutubeChannelMappingParam) {
    const has = await this.repository.findOne({
      where: { channel_endpoint: params.channel_endpoint },
    });
    if (has !== null) {
      return false;
    } else {
      return await this.repository.save(CreateYoutubeChannelMappingDto.of(params));
    }
  }

  async updateDate(id: number, diff: number) {
    const op = await this.repository.findOne({ where: { id: id } });
    if (op !== null) {
      const og = moment(op.created_at);
      if (diff > 0) {
        await this.repository.update({ id: id }, { created_at: og.add(diff, 'days').toDate() });
      } else {
        await this.repository.update(
          { id: id },
          { created_at: og.subtract(Math.abs(diff), 'days').toDate() },
        );
      }
    }
  }

  async cronStart() {
    await this.event.emitAsync(Event.CRON_START);
  }
}
