import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';

@Controller('deposits')
export class DepositsController {
  constructor(private deposits: DepositsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.deposits.list(user.messId ?? '');
  }

  @Post()
  add(@CurrentUser() user: RequestUser, @Body() dto: CreateDepositDto) {
    return this.deposits.add(user.messId ?? '', user.sub, dto);
  }
}
