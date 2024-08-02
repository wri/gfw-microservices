import { Controller, Get, Query, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '@wri-monorepos/shared';
import { ValidateCSVService } from './validate.csv.service';

const RequestValidateCSVSchema = z.object({
  fileName: z.string(),
  templateId: z.coerce.number(),
});

type RequestValidateCSVType = z.infer<typeof RequestValidateCSVSchema>;

@Controller('list/upload/csv/validate')
export class ValidateCSVController {
  constructor(private readonly validateCSVService: ValidateCSVService) {}

  @Get()
  @UsePipes(new ZodValidationPipe(RequestValidateCSVSchema))
  async getObjectPresignedURL(@Query() query: RequestValidateCSVType) {
    const { fileName, templateId } = query;
    const errorList = await this.validateCSVService.execute(fileName, templateId);
    const hasError = errorList.length > 0;
    return {
      hasError,
      errorList,
    };
  }
}
