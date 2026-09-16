import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { CostsService } from './costs.service';
import { CreateBazarCostDto } from './dto/create-bazar-cost.dto';
import { CreateUtilityCostDto } from './dto/create-utility-cost.dto';
import { UpdateBazarCostDto } from './dto/update-bazar-cost.dto';
import { UpdateUtilityCostDto } from './dto/update-utility-cost.dto';

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

  @Patch('bazar/:id')
  updateBazar(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateBazarCostDto) {
    return this.costs.updateBazar(user.messId ?? '', user.sub, id, dto);
  }

  @Delete('bazar/:id')
  removeBazar(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.costs.removeBazar(user.messId ?? '', user.sub, id);
  }

  @Patch('utility/:id')
  updateUtility(@CurrentUser() user: RequestUser, @Param('id') id: string, @Body() dto: UpdateUtilityCostDto) {
    return this.costs.updateUtility(user.messId ?? '', user.sub, id, dto);
  }

  @Delete('utility/:id')
  removeUtility(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.costs.removeUtility(user.messId ?? '', user.sub, id);
  }
}
