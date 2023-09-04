import { Module } from '@nestjs/common';
import { SwitService } from './swit.service';
import { SwitExtendsClass } from './swit.module-definition';
import { HttpModule } from '@nestjs/axios';

@Module({ imports: [HttpModule], providers: [SwitService], exports: [SwitService] })
export class SwitModule extends SwitExtendsClass {}
