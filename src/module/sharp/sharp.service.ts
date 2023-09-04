import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import sharp from 'sharp';

@Injectable()
export class SharpService {
  constructor(private readonly axios: HttpService) {}

  async urlToBuffer(url: string, isThum?: boolean) {
    try {
      console.log(url);
      const imgres = await firstValueFrom(this.axios.get(url, { responseType: 'arraybuffer' }));
      let sharpImg = sharp(imgres.data);
      const imgMetaData = await sharpImg.metadata();

      //자르기 한계값
      const width_limit = 1200;
      const height_limit = 800; //종횡비 3/2 이다.. 1.5보다 클경우 작을경우 생각하기.
      let isVertical = false; //세로로 긴 이미지인지
      const isGif = imgres.headers['content-type'] == 'image/gif'; //움직이는 이미지인지 헤더를 읽어서 컨텐츠타입을 판별하기

      if (isGif) {
        sharpImg = sharp(imgres.data, { animated: true }); //움직임 조건 부여
      }

      if (imgMetaData != undefined) {
        if (imgMetaData.width != undefined && imgMetaData.height != undefined) {
          //세로로 긴 이미지는 세로/가로 했을때 1보다 큰것들
          isVertical = imgMetaData.height / imgMetaData.width > 1;
          if (isVertical) {
            //세로 이미지
            if (isThum) {
              //(썸네일일 경우)가로 비율에 맞추어 커버화하고 중심을 top시켜서 자르기.
              return await sharpImg
                .resize({
                  width: width_limit,
                  height: height_limit,
                  fit: 'cover',
                  position: 'top',
                }) //세로도 잘라야 하로 높이제한 두기
                .jpeg()
                .toBuffer();
            } else {
              if (imgMetaData.width >= width_limit) {
                // (본문일 경우)이런류는 원본이 중요하니까 리사이징하지 말고 커맨드
                return await sharpImg.webp().toBuffer();
              } else {
                // 작은 건  늘이기
                return await sharpImg
                  .resize({ width: width_limit, fit: 'inside' }) //1200까지 늘이기
                  .jpeg()
                  .toBuffer();
              }
            }
          } else {
            //가로 이미지
            return await sharpImg
              .resize({
                width: width_limit,
                height: height_limit,
                fit: isThum ? 'outside' : 'inside',
              })
              .jpeg()
              .toBuffer();
          }
        }
      }
    } catch (err) {
      console.log(`getImageBuffer Err: `);
      return false;
    }
  }
}
