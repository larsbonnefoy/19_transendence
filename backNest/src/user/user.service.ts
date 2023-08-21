import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { ChatMessage } from '../chat/chat.entity';
import { Api42Service } from '../api42/api42.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // @Inject(forwardRef(() => Api42Service))
    // private  api42Service: Api42Service
  ) {}

  async createUser(User: User): Promise<User> {
    return await this.userRepository.save(User);
  }

  async change_username(login42: string, username: string) {
    await this.userRepository.update(login42, {username:username});
  }
  
  async add_friend(login42: string, current_friend_list: string[], friend: string) {
    current_friend_list.push(friend);
    await this.userRepository.update(login42, {friends:current_friend_list});
  }

  async remove_friend(login42: string, current_friend_list: string[], friend: string) {
    let new_friend_list: Array<string> = new Array(0);
    for (let iter of current_friend_list) {
      if (iter != friend)
        new_friend_list.push(iter);
    }
    await this.userRepository.update(login42, {friends:new_friend_list});
  }
  
  async addWin(login42: string, win: number) {
    console.log("win for %s, now at %d wins", login42, win);
    await this.userRepository.update(login42, {win:win});
  }
  
  async addLoss(login42: string, loss: number) {
    console.log("loss for %s, now at %d loss", login42, loss);
    await this.userRepository.update(login42, {loss:loss});
  }

  findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findOne(str: string): Promise<User | null> {
    return this.userRepository.findOneBy({ login42:str });
  }

  findUsername(str: string): Promise<User | null> {
    return this.userRepository.findOneBy({ username:str });
  }

  //2fa userservives
  async update2faSecret(login42: string, secret : Buffer)
  {
	  await this.userRepository.update(login42, {twofaSecret:secret});
  }

  async enable2fa(login42: string)
  {
	  await this.userRepository.update(login42, {has2fa:true});
  }

  async disable2fa(login42: string)
  {
	  await this.userRepository.update(login42, {has2fa:false});
	  await this.userRepository.update(login42, {twofaSecret:null});
  }

  //char userservices
  
 	async addMessage(id: string, newMessage: ChatMessage)
	{
		const user: User = await this.findOne(id);
		if (user != null)
		{
			user.messages.push(newMessage);
			await this.userRepository.save(user);
		}
	}
  


  // getUsername(login42: string): string {
  //   const user = this.userRepository.findOneBy({ login42:login42 });
  //   if (user == null)
  //     return "";
  //   return user.then.arguments.username;
  // }

  // getLoginFromUsername(username: string): string {
  //   const user = this.userRepository.findOneBy({ username: username });
  //   if (user == null)
  //     return "";
  //   return user.then.arguments.login42;
  // }

  async remove(username: string): Promise<void> {
    await this.userRepository.delete({username:username});
  }
}
