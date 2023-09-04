import { ConfigurableModuleBuilder } from '@nestjs/common';
import { ISwitOption } from './swit.interface';

const switExtendsModule = new ConfigurableModuleBuilder<ISwitOption>().build();

export const SwitExtendsClass = switExtendsModule.ConfigurableModuleClass;
export const SWIT_TOKEN = switExtendsModule.MODULE_OPTIONS_TOKEN;
