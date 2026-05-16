// clients/dto/create-client.dto.ts
import { IsString, IsEmail, IsOptional, Matches, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClientDto {
  @ApiProperty({ example: 'Анна Смирнова' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: '+79161234567' })
  @IsString()
  @Matches(/^(?:\+7|8)[\d\s\-()]{9,}$/, { message: 'Invalid RU phone format' })
  phone: string;

  @ApiPropertyOptional({ example: 'anna@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;
}
