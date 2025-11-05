import { IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateBrandDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsUrl()
    logoUrl?: string;
}
