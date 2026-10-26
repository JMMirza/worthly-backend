import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class JwtPayloadDto {
  id: number;
  email: string;
  role: string;
  currency: string;
}


export class RefreshTokenDto {
  @ApiProperty({
    description: 'The refresh token received during login',
    example: 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6',
    required: true
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}