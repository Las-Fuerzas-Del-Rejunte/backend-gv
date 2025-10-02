import {
  BadRequestException,
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
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';
import { Sale } from './entities/sale.entity';

@Controller('api/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  findAll(): Promise<Sale[]> {
    return this.salesService.findAll();
  }

  @Get('by-employee/:employeeId')
  findByEmployee(
    @Param('employeeId', new ParseUUIDPipe()) employeeId: string,
  ): Promise<Sale[]> {
    return this.salesService.findByEmployee(employeeId);
  }

  @Get('by-date-range')
  findByDateRange(
    @Query('start') startDate?: string,
    @Query('end') endDate?: string,
  ): Promise<Sale[]> {
    if (!startDate || !endDate) {
      throw new BadRequestException('Query params "start" and "end" are required');
    }

    if (new Date(startDate) > new Date(endDate)) {
      throw new BadRequestException('Start date must be before end date');
    }

    return this.salesService.findByDateRange(startDate, endDate);
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string): Promise<Sale> {
    return this.salesService.findOne(id);
  }

  @Post()
  create(@Body() payload: CreateSaleDto): Promise<Sale> {
    return this.salesService.create(payload);
  }

  @Put(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() payload: UpdateSaleDto,
  ): Promise<Sale> {
    return this.salesService.update(id, payload);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
    return this.salesService.remove(id);
  }
}
