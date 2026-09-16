import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';import { CurrentUser, RequestUser } from '../auth/current-user.decorator';
import { Public } from '../auth/public.decorator';
import { CreatePollDto } from './dto/create-poll.dto';
import { VoteDto } from './dto/vote.dto';
import { PollsService } from './polls.service';

@Controller('polls')
export class PollsController {
  constructor(private polls: PollsService) {}

  @Get()
  list(@CurrentUser() user: RequestUser) {
    return this.polls.list(user.messId ?? '');
  }

  @Public()
  @Get('token/:token')
  getByToken(@Param('token') token: string) {
    return this.polls.getByToken(token);
  }

  @Post()
  create(@CurrentUser() user: RequestUser, @Body() dto: CreatePollDto) {
    return this.polls.create(user.messId ?? '', user.sub, dto);
  }

  @Public()
  @Post(':id/vote')
  vote(@Param('id') id: string, @Body() dto: VoteDto) {
    return this.polls.vote(id, dto);
  }

  @Patch(':id/close')
  close(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.polls.close(user.messId ?? '', user.sub, id);
  }

  @Delete(':id')
  remove(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.polls.remove(user.messId ?? '', user.sub, id);
  }
}
