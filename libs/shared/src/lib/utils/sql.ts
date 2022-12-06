import * as sql from 'mssql';
/**
 * @function getDataType
 * @summary Converts text to sql data type object
 * @param {String} type - the text type to convert and return
 * @return {Object} the SQL data type
 */
export const getDataType = (type) => {
  let dataType = null;
  switch (type) {
    case 'geometry':
      //dataType = sql.Geometry;
      dataType = sql.NVarChar(sql.MAX);
      break;
    case 'int':
      dataType = sql.Int;
      break;
    case 'bigint':
      dataType = sql.BigInt;
      break;
    case 'float':
      dataType = sql.Float;
      //dataType = sql.NVarChar(150);
      break;
    case 'datetime':
      dataType = sql.DateTime;
      //dataType = sql.NVarChar(150);
      break;
    case 'smalldatetime':
      dataType = sql.SmallDateTime;
      //dataType = sql.NVarChar(150);
      break;
    case 'text':
      //dataType = sql.NVarChar(sql.MAX);
      dataType = sql.Text;
      break;
    case 'nvarchar':
      dataType = sql.NVarChar(150);
      break;
    case 'binary':
      //dataType = sql.NVarChar(150);
      dataType = sql.Binary;
      // dataType = sql.NVarChar(2);
      //dataType = sql.Int;
      break;
    case 'sql_variant':
      dataType = sql.Variant;
      break;
    case 'bit':
      dataType = sql.Bit;
      //dataType = sql.NVarChar(150);
      break;
    default:
      dataType = sql.NVarChar(150);
    // dataType = {};
  }
  return dataType;
};
