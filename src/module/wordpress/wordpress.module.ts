import { Module } from '@nestjs/common';
import { WordpressService } from './wordpress.service';
import { WordpressExtendsClass } from './wordpress.module-definition';
import { SwitModule } from '../swit/swit.module';

@Module({
  imports: [SwitModule.register({})],
  providers: [WordpressService],
  exports: [WordpressService],
})
export class WordpressModule extends WordpressExtendsClass {}
