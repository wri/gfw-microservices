import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import validator from 'validator';

@ValidatorConstraint({ name: 'isEmailArray', async: false })
export class IsEmailArrayConstraint implements ValidatorConstraintInterface {
  validate(addressees: string[]): boolean {
    return addressees.every((email) => validator.isEmail(email));
  }

  defaultMessage(): string {
    return 'Each address in the array must be a valid email address';
  }
}

export function IsEmailArray(validationOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'IsEmailArray',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailArrayConstraint,
    });
  };
}
