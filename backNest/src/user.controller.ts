import { Controller, Get, Post, Param, Query, ParseIntPipe, ParseUUIDPipe, Res } from '@nestjs/common';
// import { IsInt, IsString } from 'class-validator';
// import { identity } from 'rxjs';

import { User } from './user.entity';
import { UserService } from './user.service';
import { newUserDto } from './newUserDto.dto';

@Controller("user")
export class UserController {
  constructor(private readonly userService: UserService) {}
  
  @Get('one:name')
  async getOneUser(@Res() res: any, @Param() params: any) {
    console.log("got request for user with name %s", params.name.slice(1));
    const messages = await this.userService.findName(params.name.slice(1));
    res.json(messages);
  }
  
  @Get('get')
  async getUser(@Res() res: any) {
	console.log("got get request");
    const messages = await this.userService.findAll();
    res.json(messages);
  }

  @Get('add')
  async addUser(@Res() res: any, @Query() query: newUserDto) {
	console.log("got from query: %s as name and %s as password", query.name, query.password);
    const nUser: User = new User;
    nUser.name = query.name;
    nUser.password = query.password;
    await this.userService.createUser(nUser);
    res.json({"user":"created"});
  }

  @Get('del')
  async delUser(@Res() res: any, @Query('id', ParseIntPipe) id: number) {
	console.log("got del request with id %d", id);
    this.userService.remove(id);
    res.json({"user":"deleted"});
  }
}
