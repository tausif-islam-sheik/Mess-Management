import { Body, Controller, Get, Patch } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { UpdateMessDto } from './dto/update-mess.dto';
import { MessService } from './mess.service';

@Controller('mess')
export class MessController {
  constructor(private mess: MessService) {}

  @Get()
  list() {
    return this.mess.list();
  }

  @Get('current')
  current(@CurrentUser() user: RequestUser) {
    return this.mess.get(user.messId ?? '');
  }

  @Patch('current')
  update(@CurrentUser() user: RequestUser, @Body() dto: UpdateMessDto) {
    return this.mess.update(user.messId ?? '', user.sub, dto);
  }

  @Get('current/summary')
  summary(@CurrentUser() user: RequestUser) {
    return this.mess.summary(user.messId ?? '');
  }
}
