import { Module } from '@nestjs/common';
import { SharpService } from '../sharp/sharp.service';
import { SharpExtendsClass } from './sharp.module-definition';
import { HttpModule } from '@nestjs/axios';

@Module({ imports: [HttpModule], providers: [SharpService], exports: [SharpService] })
export class SharpModule extends SharpExtendsClass {}
