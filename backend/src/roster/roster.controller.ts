import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { CreateRosterDto } from './dto/create-roster.dto';
import { RosterService } from './roster.service';

@Controller('roster')
export class RosterController {
  constructor(private roster: RosterService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.roster.list(user.messId ?? '');
  }

  @Post()
  assign(@CurrentUser() user: RequestUser, @Body() dto: CreateRosterDto) {
    return this.roster.assign(user.messId ?? '', user.sub, dto);
  }

  @Patch(':id/status')
  setStatus(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() body: { status: string },
  ) {
    return this.roster.setStatus(user.messId ?? '', user.sub, id, body.status);
  }
}
