import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
  @Get()
  root(@Res() res: Response) {
    res.redirect('/widget/index.html');
  }

  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
