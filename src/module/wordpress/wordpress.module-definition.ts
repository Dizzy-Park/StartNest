import { ConfigurableModuleBuilder } from '@nestjs/common';
import { IWordpressOption } from './wordpress.interface';

const wordpressExtendsModule = new ConfigurableModuleBuilder<IWordpressOption>().build();

export const WordpressExtendsClass = wordpressExtendsModule.ConfigurableModuleClass;
export const WORDPRESS_TOKEN = wordpressExtendsModule.MODULE_OPTIONS_TOKEN;
