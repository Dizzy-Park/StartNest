import { Body, Controller, Get, Post, Put, Query, UseGuards } from '@nestjs/common';
import { YoutubeSettingService } from './youtubeSetting.service';
import { PageParam, ReturnRes } from 'src/common/common.dto';
import { CreateYoutubeChannelMappingParam } from 'src/entity/dto/youtube_channel_mapping.dto';
import { TokenGuard } from 'src/common/token.guard';

@Controller('settings')
export class YoutubeSettingController {
  constructor(private readonly service: YoutubeSettingService) {}

  @Get()
  async findAll(@Query() params: PageParam) {
    const list = await this.service.findAll(params);
    return ReturnRes.of({ data: list });
  }

  @UseGuards(TokenGuard)
  @Post()
  async createOne(@Body() params: CreateYoutubeChannelMappingParam) {
    const data = await this.service.createOne(params);
    if (data !== false) {
      return ReturnRes.of({ data, message: '정상 등록 되었습니다.' });
    } else {
      return ReturnRes.of({ code: 204, message: '이미 존재합니다.' });
    }
  }

  @UseGuards(TokenGuard)
  @Get('init')
  async init() {
    return ReturnRes.of({ message: '정상 등록 되었습니다.' });
  }

  @UseGuards(TokenGuard)
  @Get('cron')
  async cron() {
    await this.service.cronStart();
    return ReturnRes.of({ message: '정상 시작 되었습니다.' });
  }

  @Put('date')
  async updateDate(@Body('id') id: number, @Body('diff') diff: number) {
    console.log(id, diff);
    await this.service.updateDate(id, diff);
    return ReturnRes.of({ message: '정상 등록 되었습니다.' });
  }
}
