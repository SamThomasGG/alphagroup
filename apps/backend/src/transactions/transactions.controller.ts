import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  UsePipes,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import {
  RequirePermissions,
  PermissionsGuard,
} from '../common/guards/permissions.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import {
  createTransactionSchema,
  CreateTransactionDto,
} from '../schemas/transaction.schema';

@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('can_view_transactions')
  async findAll() {
    return this.transactionsService.findAll();
  }

  @Post()
  @UseGuards(PermissionsGuard)
  @RequirePermissions('can_input_transactions')
  @UsePipes(new ZodValidationPipe(createTransactionSchema))
  async create(
    @Body() createTransactionDto: CreateTransactionDto,
    @Request() req,
  ) {
    return this.transactionsService.create(
      createTransactionDto,
      req.user.userId,
    );
  }

  @Post(':id/approve')
  @UseGuards(PermissionsGuard)
  @RequirePermissions('can_approve_transactions')
  async approve(@Param('id') id: string, @Request() req) {
    return this.transactionsService.approve(id, req.user.userId);
  }
}
