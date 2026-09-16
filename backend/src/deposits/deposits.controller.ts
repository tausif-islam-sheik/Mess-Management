import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { DepositsService } from './deposits.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { UpdateDepositDto } from './dto/update-deposit.dto';

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

  @Patch(':id')
  update(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateDepositDto) {
    return this.deposits.update(user.messId ?? '', user.sub, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.deposits.remove(user.messId ?? '', user.sub, id);
  }
}
