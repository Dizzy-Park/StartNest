import { IsOptional } from 'class-validator';
import { Column, CreateDateColumn, DeleteDateColumn, UpdateDateColumn } from 'typeorm';

export class AbsUpdateVo {
  @UpdateDateColumn({ select: false })
  updated_at: string;
}

export class AbsBaseEntity extends AbsUpdateVo {
  @CreateDateColumn({ select: false })
  created_at: string;
}

export class AbsRemoveVo extends AbsUpdateVo {
  @Column({ select: false })
  remove: number;
  @DeleteDateColumn({ select: false })
  removed_at: string;
}

export class PageParam {
  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  readonly page?: number = 1;

  @IsOptional()
  // @IsNumberString({ no_symbols: true })
  readonly size?: number = 10;
}

export class PageInfoDto {
  current: number;
  size: number;
  total: number;
}

export class ListContentDto {
  page_info: PageInfoDto;
}

export class ReturnRes {
  static of<T>({ code = 200, data, message }: { code?: number; data?: T; message?: string }) {
    return { code: code, content: data, message: message };
  }
}

export class ReturnList<T = any> {
  list: Array<T>;
  page_info: {
    current: number;
    size: number;
    total: number;
  };

  static of<T>(list: Array<T>, page: number, size: number, count: number) {
    return {
      list: list,
      page_info: {
        current: page,
        size: size,
        total: count,
      },
    } as ReturnList<T>;
  }
}

export async function forEachPromise<T, R>(
  items: Array<T>,
  func: (item: T, index: number) => Promise<R>,
): Promise<Array<R>> {
  const ar: Array<R> = [];
  await items.reduce(
    (promise: Promise<R>, item: T, idx: number) => {
      return promise.then(async () => {
        ar.push(await func(item, idx));
        return promise;
      });
    },
    Promise.resolve({} as R),
  );
  return ar;
}

export const slip = (delay: number) => new Promise(res => setTimeout(res, delay));
