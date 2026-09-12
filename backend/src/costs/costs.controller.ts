import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { CostsService } from './costs.service';
import { CreateBazarCostDto } from './dto/create-bazar-cost.dto';
import { CreateUtilityCostDto } from './dto/create-utility-cost.dto';

@Controller('costs')
export class CostsController {
  constructor(private costs: CostsService) {}

  @Get('bazar')
  listBazar(@CurrentUser() user: RequestUser) {
    return this.costs.listBazar(user.messId ?? '');
  }

  @Get('utility')
  listUtility(@CurrentUser() user: RequestUser) {
    return this.costs.listUtility(user.messId ?? '');
  }

  @Post('bazar')
  addBazar(@CurrentUser() user: RequestUser, @Body() dto: CreateBazarCostDto) {
    return this.costs.addBazar(user.messId ?? '', user.sub, dto);
  }

  @Post('utility')
  addUtility(@CurrentUser() user: RequestUser, @Body() dto: CreateUtilityCostDto) {
    return this.costs.addUtility(user.messId ?? '', user.sub, dto);
  }
}
