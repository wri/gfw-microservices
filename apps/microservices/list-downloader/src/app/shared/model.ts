type TemplateOperation = {
  name?: string | undefined;
  parsed: string;
  key?: string | undefined;
  analysis?: boolean | undefined;
  composites?:
    | {
        attribute: string;
        label?: string;
        following?: {
          attribute: string;
          parsed: string;
        };
      }[]
    | undefined;
  numerators?:
    | {
        extentAttribute: string;
        tclAttribute: string;
        label: string;
      }[]
    | undefined;
  fields?:
    | {
        attribute: string;
        parsed: string;
        type?: string;
      }[]
    | undefined;
  additionalFields?:
    | {
        attribute: string;
        parsed: string;
      }[]
    | undefined;
  following?:
    | {
        attribute: string;
        parsed: string;
      }[]
    | undefined;
}[];

export { TemplateOperation };
