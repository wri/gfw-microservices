import { getListAttributes, saveListAttributes, ListAttributesRecord } from '@wri-monorepos/sql';
import { Logger } from '@nestjs/common';

export const mergeSourceDestinyListAttributes = async (
  organizationDatabase: string,
  selectedListId: number,
  destinyListId: number
) => {
  const logger = new Logger('mergeSourceDestinyListAttributes');

  try {
    // Get attributes from both lists
    const sourceAttributes = await getListAttributes(organizationDatabase, selectedListId);
    const destinyAttributes = await getListAttributes(organizationDatabase, destinyListId);

    // Create a map of destiny attributes for quick lookup
    const destinyAttributesMap = new Map(
      destinyAttributes.map((attr) => [attr.attribute_name, attr])
    );

    // Find attributes that exist in source but not in destiny
    const attributesToAdd: ListAttributesRecord[] = sourceAttributes
      .filter((sourceAttr) => !destinyAttributesMap.has(sourceAttr.attribute_name))
      .map((sourceAttr) => ({
        list_id: destinyListId,
        attribute_name: sourceAttr.attribute_name,
        attribute_type: sourceAttr.attribute_type,
      }));

    // Save new attributes to destiny list if any
    if (attributesToAdd.length > 0) {
      logger.log(
        `Adding ${attributesToAdd.length} new attributes to destiny list ${destinyListId}`
      );
      await saveListAttributes(organizationDatabase, attributesToAdd);
    }

    return attributesToAdd;
  } catch (error) {
    logger.error(`Error merging attributes: ${error.message}`);
    throw error;
  }
};
