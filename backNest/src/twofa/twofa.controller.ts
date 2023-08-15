import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
import { TwofaService } from './twofa.service';
import { jwtDto } from '../api42/jwtDto.dto';
import { UserService } from '../user/user.service';
import { Api42Service } from '../api42/api42.service';

@Controller('twofa')
export class TwofaController {
  constructor(
	private readonly twofaService: TwofaService,
	private userService : UserService, 
	private api42Service: Api42Service) {}

	@Post('enable')
	async enable2fa(@Body() jwtDto: jwtDto)
	{
		try
		{
			console.log(jwtDto.token);
			const login42 = this.api42Service.decodeJWT(jwtDto.token);
			const twofaJSON = await this.twofaService.generate2fa(await this.userService.findOne(login42));
			console.log(twofaJSON);
			const qrUrl = await this.twofaService.generateQR(twofaJSON['otpUrl'])
			console.log('hmmm : '+ qrUrl);
			this.userService.enable2fa(login42, twofaJSON['secret']); //TODO CYPHER SECRET
			return (qrUrl);
		}
		catch (error)
		{
			console.log("error");
			try
			{
				const login42 = this.api42Service.decodeJWT(jwtDto.token);
				this.userService.disable2fa(login42);
			}
			catch {}
			return error;
		}
	}

	@Get('enable')//to remove
	async enable2faGET(@Query() jwtDto : jwtDto, @Res({passthrough: true}) response)
	{
		try
		{
			console.log('token :' + jwtDto.token);
			const login42 = this.api42Service.decodeJWT(jwtDto.token);
			const twofaJSON = await this.twofaService.generate2fa(await this.userService.findOne(login42));
			console.log(twofaJSON);
			console.log('yo')
			const qrUrl = await this.twofaService.generateQR(twofaJSON['otpUrl'])
			console.log('hmmm : '+ qrUrl);
			this.userService.enable2fa(login42, twofaJSON['secret']);
			const htmlStr : string = "<!DOCTYPE html>\n<html>\n<head>\n<title>Base64 QR</title>\n</head>\n<body>\n<h1>Base64 QR</h1>\n<img alt=\"qr\" src=" + qrUrl + ">\n</body>\n</html>"
			await response.status(200).send(htmlStr);
			// return (qrUrl);
			return ;
		}
		catch (error)
		{
			console.log("error")
			return error;
		}
	}

	@Post('login')
	async login(@Body() body:string)
	{
			const login42 = this.api42Service.decodeJWT(body['jwt_token']);
			console.log('code :' + body['code'])
			console.log("twofaSecret " + (await this.userService.findOne(login42)).twofaSecret)
			return (this.twofaService.verify2fa(body['code'], (await this.userService.findOne(login42)).twofaSecret));
	}

	@Post('disable')
	async disable2fa(@Body() jwtDto: jwtDto)
	{
		try
		{

			const login42 = this.api42Service.decodeJWT(jwtDto.token);
			await this.userService.disable2fa(login42);
			return ;
		}
		catch (error)
		{
			return error;
		}
	}

	@Get('disable')
	async disable2faGET(@Query() jwtDto: jwtDto)
	{
		try
		{

			const login42 = this.api42Service.decodeJWT(jwtDto.token);
			await this.userService.disable2fa(login42);
			return ;
		}
		catch (error)
		{
			return error;
		}
	}
}

