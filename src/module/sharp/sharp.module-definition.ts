import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ISharpOption } from './sharp.interface';

const sharpExtendsModule = new ConfigurableModuleBuilder<ISharpOption>().build();

export const SharpExtendsClass = sharpExtendsModule.ConfigurableModuleClass;
export const SHARP_TOKEN = sharpExtendsModule.MODULE_OPTIONS_TOKEN;
