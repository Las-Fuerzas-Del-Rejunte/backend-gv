import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { LinesService } from './lines.service';
import { CreateLineDto } from './dto/create-line.dto';
import { UpdateLineDto } from './dto/update-line.dto';
import { Line } from './entities/line.entity';

@Controller('api/lines')
export class LinesController {
  constructor(private readonly linesService: LinesService) {}

  @Get()
  findAll(): Promise<Line[]> {
    return this.linesService.findAll();
  }

  @Get('check/name')
  async checkName(
    @Query('name') name: string,
    @Query('brandId', ParseUUIDPipe) brandId: string,
  ): Promise<{ exists: boolean }> {
    const exists = await this.linesService.checkNameExists(brandId, name);
    return { exists };
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Line> {
    return this.linesService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateLineDto): Promise<Line> {
    return this.linesService.create(payload);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateLineDto,
  ): Promise<Line> {
    return this.linesService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.linesService.remove(id);
  }
}
