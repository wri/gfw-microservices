import { Logger } from '@nestjs/common';
import { AbstractHandler, ChainType, RequestNewList } from './types';

const mandatoryFields = {
  template_1: ['field1', 'field2', 'field3'],
  template_2: ['fieldA', 'fieldB'],
  // Add more templates and their mandatory fields as needed
};

export class ValidateMandatoryFields extends AbstractHandler<ChainType> {
  private readonly logger = new Logger(ValidateMandatoryFields.name);

  async handle(input: ChainType): Promise<ChainType> {
    // Check if the name contains only alphanumeric characters and spaces
    const { request, geojson } = input;
    const { template_id } = request as RequestNewList;

    const fieldsToCheck = mandatoryFields[template_id];
    if (!fieldsToCheck) {
      throw new Error(`Invalid template ID: ${template_id}`);
    }

    geojson.features.every((feature) => {
      const hasFields = fieldsToCheck.every((field) => field in feature);
      if (!hasFields) {
        feature.properties.errorDetails = feature.properties.errorDetails || [];
        (feature.properties.errorDetails as Array<string>).push('Missing mandatory fields');
      }
    });

    return input;
  }
}
