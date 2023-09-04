import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SwitService {
  constructor(private readonly axios: HttpService) {}

  async message(message: string) {
    await firstValueFrom(
      this.axios.post(
        `https://hook.swit.io/chat/23082401525295QUSGWJ/yp7G0pAgROTYtRrKCrqV?organization_id=230105073670wNAb1Zv`,
        { text: message },
        { headers: { 'Content-type': 'application/json' } },
      ),
    );
  }
}
