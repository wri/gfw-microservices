import './DataTemplates.scss';
import { ReactElement, useState, MouseEvent, ElementType, FC } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Check,
  Close,
  Description,
  Download,
  DownloadDone,
  Info,
  Public,
} from '@mui/icons-material';
import GeoJsonIcon from '../../../../../assets/icons/geojson-icon.svg';
import ShapeFileIcon from '../../../../../assets/icons/shapefile-icon.svg';

import { ExternalHelperResource, PillButton } from '../../../../../components';
import { aws_templates } from '../../../../../common/js/config';
import { ToggleButtonGroup } from '../../../../../components/ToggleButtonGroup';
import { ExternalLinks } from '../../../../../utils/constants';
import { UploadType } from '../types';

type DataTemplatesProps = {
  isOpen: boolean;
  onClose: () => void;
  workflowType: UploadType;
};

enum TemplateById {
  CAR,
  UML,
}

enum TemplateByFile {
  PolygonShapeFile,
  PolygonGeoJson,
  PolygonKml,
  PointShapeFile,
  PointGeoJson,
  PointSpreadsheet,
}

const ImgIcon: FC<{ src: string; alt: string }> = ({ src, alt }) => (
  <img src={src} alt={alt} style={{ height: '28px', width: '28px', marginLeft: '2px' }} />
);

export function DataTemplates({ isOpen, onClose, workflowType }: DataTemplatesProps) {
  const theme = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateByFile | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<TemplateByFile | null>(null);
  const [downloadedTemplates, setDownloadedTemplates] = useState<(TemplateByFile | TemplateById)[]>(
    []
  );
  const templateTypeOptions = ['All', 'Polygon', 'Point'];
  const [selectedTemplateType, setSelectedTemplateType] = useState(
    templateTypeOptions[0].toLocaleLowerCase()
  );
  const isById = workflowType === UploadType.ById;
  const infoBoxText = isById ? (
    <>
      Shapefiles or GeoJSON? Use the <b>By File</b> option on the upload page to access those
      templates.
    </>
  ) : (
    <>
      IDs like CAR or Palm Oil Mills? Use the <b>By ID</b> option on the upload page to access those
      templates.
    </>
  );

  const handleSelectTemplate = (template: TemplateByFile) => {
    setSelectedTemplate((prev) => (prev === template ? null : template));
  };

  const handleDownloadTemplate = (
    e: MouseEvent<HTMLButtonElement>,
    template: TemplateByFile,
    filename: string
  ) => {
    e.stopPropagation();

    window.open(`${aws_templates}${filename}`);
    setDownloadedTemplates((prev) => [...prev, template]);
  };

  const filteredTemplateOptions = isById
    ? templateOptionsById
    : selectedTemplateType === templateTypeOptions[0].toLocaleLowerCase()
    ? templateOptionsByFile
    : templateOptionsByFile.filter((x) =>
        selectedTemplateType === 'polygon' ? x.isPolygon : !x.isPolygon
      );

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        mt: 5,
        '& .MuiDialog-paper': {
          maxWidth: '700px',
          minHeight: '540px',
        },
      }}
      data-testid="data-templates"
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          pt: 0,
          px: 2,
          pb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Download data templates</Typography>
          <IconButton onClick={onClose}>
            <Close fontSize="medium" />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />

        <Typography variant="body1" color={theme.palette.text.secondary}>
          Select a data type to view details and download a template. Use the template to format
          your data, then upload into GFW Pro.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <ExternalHelperResource
            text="How to format your location data for GFW Pro"
            url={ExternalLinks.HowToFormatLocationData}
            color="primary"
          />
          <ExternalHelperResource
            text="Learn more about GFW Pro templates"
            url="https://globalforestwatch.org/help/gfw-pro/guides/select-correct-template"
            color="primary"
          />
        </Box>
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            border: '1px solid #E5E5E5',
            borderRadius: '5px',
            p: 1,
            mt: 2,
          }}
        >
          <Info fontSize="small" />
          <Typography variant="caption">Looking to upload locations using {infoBoxText}</Typography>
        </Box>
        {workflowType === UploadType.ByFile && (
          <Box sx={{ mx: 'auto', mt: 3 }}>
            <ToggleButtonGroup
              options={templateTypeOptions}
              selectedOption={selectedTemplateType}
              onOptionChange={(v) => setSelectedTemplateType(v)}
            />
          </Box>
        )}
        <DialogContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            px: 0,
          }}
        >
          {filteredTemplateOptions.map(
            ({
              title,
              Icon,
              template,
              bestForText,
              requiredFieldsText,
              filename,
              helpCenterLinkText,
              helpCenterLinkUrl,
            }) => {
              const isSelected = selectedTemplate === template;
              const isHovered = hoveredTemplate === template;
              const isAlreadyDownloaded = downloadedTemplates.includes(template);

              return (
                <Accordion
                  key={template}
                  expanded={isSelected}
                  onChange={() => handleSelectTemplate(template)}
                  onMouseEnter={() => setHoveredTemplate(template)}
                  onMouseLeave={() => setHoveredTemplate(null)}
                  sx={{
                    border: '1px solid #E5E5E5',
                    borderRadius: 1,
                    boxShadow: 'none',
                    '&::before': {
                      display: 'none',
                    },
                    transition: '0.5s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.background.default,
                    },
                  }}
                >
                  <AccordionSummary
                    sx={{
                      backgroundColor: isSelected ? theme.palette.primary[200] : 'none',
                      '& .MuiAccordionSummary-content': {
                        margin: 0,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                      }}
                    >
                      <Icon />
                      <Typography>{title}</Typography>
                    </Box>

                    {!isSelected ? (
                      <>
                        {isAlreadyDownloaded && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              ml: 'auto',
                            }}
                          >
                            <Check fontSize="medium" />
                          </Box>
                        )}
                        {isHovered && !isAlreadyDownloaded && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              ml: 'auto',
                              color: theme.palette.primary.main,
                            }}
                          >
                            <Typography>See more</Typography>
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        {!isAlreadyDownloaded ? (
                          <PillButton
                            variant="contained"
                            startIcon={<Download />}
                            sx={{ ml: 'auto' }}
                            onClick={(e) => handleDownloadTemplate(e, template, filename)}
                          >
                            <Typography variant="caption" sx={{ fontWeight: 'medium' }}>
                              Download
                            </Typography>
                          </PillButton>
                        ) : (
                          <PillButton
                            variant="contained"
                            startIcon={<DownloadDone />}
                            sx={{ ml: 'auto' }}
                            onClick={(e) => e.stopPropagation()}
                          />
                        )}
                      </>
                    )}
                  </AccordionSummary>
                  <AccordionDetails
                    sx={{
                      backgroundColor: theme.palette.background.default,
                      borderTop: '1px solid #E5E5E5',
                      padding: 2,
                    }}
                  >
                    <Box sx={{ ml: 4 }}>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Box sx={{ flex: '3', maxHeight: '150px', pr: 2, overflow: 'auto' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mb: 1.5, fontWeight: 'medium' }}
                          >
                            Best for
                          </Typography>
                          <Typography
                            variant="caption"
                            color={theme.palette.text.secondary}
                            className="data-templates"
                          >
                            {bestForText}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: '5', maxHeight: '150px', pr: 4, overflow: 'auto' }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', mb: 1.5, fontWeight: 'medium' }}
                          >
                            Required fields
                          </Typography>
                          <Typography
                            variant="caption"
                            color={theme.palette.text.secondary}
                            className="data-templates"
                          >
                            {requiredFieldsText}
                          </Typography>
                        </Box>
                      </Box>
                      <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}
                        sx={{ my: 2, display: 'inline-block' }}
                      >
                        You may also include additional fields of your choice (whatever numerical or
                        text fields are helpful for you to have available when viewing your location
                        data in Pro).
                      </Typography>
                    </Box>
                    <ExternalHelperResource
                      text={helpCenterLinkText}
                      url={helpCenterLinkUrl}
                      color="info"
                    />
                  </AccordionDetails>
                </Accordion>
              );
            }
          )}
        </DialogContent>

        <DialogActions sx={{ mt: 'auto' }}>
          <PillButton
            onClick={onClose}
            variant="contained"
            color="info"
            sx={{ alignSelf: 'end', mt: 'auto' }}
          >
            Done
          </PillButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

const templateOptionsByFile: {
  template: TemplateByFile;
  Icon: ElementType;
  title: string;
  bestForText: string | ReactElement;
  requiredFieldsText: ReactElement;
  filename: string;
  helpCenterLinkText: string;
  helpCenterLinkUrl: string;
  isPolygon: boolean;
}[] = [
  {
    template: TemplateByFile.PolygonShapeFile,
    Icon: () => <ImgIcon src={ShapeFileIcon} alt="Shapefile Icon" />,
    title: 'Polygon Shapefile',
    bestForText:
      'If you have sourcing locations with explicit boundaries. Requires formatting in a GIS software such as QGIS.',
    requiredFieldsText: (
      <>
        <span>
          Your polygon shapefile must be in the EPSG-4326 WGS 84 projection. The following field
          must be present in your polygon shapefile's attribute table:
        </span>
        <ul>
          <li>Location_N (Name of your locations)</li>
        </ul>
      </>
    ),
    filename: 'GFWPro-PolygonShapefile.zip',
    helpCenterLinkText: 'How to format polygon shape file data',
    helpCenterLinkUrl:
      'https://globalforestwatch.org/help/gfw-pro/guides/prepare-shapefiles-upload',
    isPolygon: true,
  },
  {
    template: TemplateByFile.PolygonGeoJson,
    Icon: () => <ImgIcon src={GeoJsonIcon} alt="GeoJson Icon" />,
    title: 'Polygon GeoJSON',
    bestForText:
      'If you have sourcing locations with explicit boundaries. Requires formatting in GIS software such as QGIS, or a code-editing software such as Studio Code.',
    requiredFieldsText: (
      <>
        <span>
          Your polygon GeoJSON must be in the EPSG-4326 WGS 84 projection. The following field must
          be present in your GeoJSON file:
        </span>
        <ul>
          <li>Location Name (Name of your location)</li>
        </ul>
      </>
    ),
    filename: 'GFWPro-Polygon_GeoJSON.geojson',
    helpCenterLinkText: 'How to format GeoJSON data',
    helpCenterLinkUrl: 'https://globalforestwatch.org/help/gfw-pro/guides',
    isPolygon: true,
  },
  {
    template: TemplateByFile.PolygonKml,
    Icon: Public,
    title: 'Polygon KML',
    bestForText:
      'Best for: If you have sourcing locations with explicit boundaries. This format is often used in conjunction with Google Earth, since Earth exports in KML format. Requires formatting in a text editor such as Notepad++',
    requiredFieldsText: (
      <>
        <span>The following fields must be present in your KML file:</span>
        <ul>
          <li>Location Name (Name of your locations)</li>
        </ul>
      </>
    ),
    filename: 'GFWPro-KML.kml',
    helpCenterLinkText: 'How to format KML data',
    helpCenterLinkUrl:
      'https://globalforestwatch.org/help/gfw-pro/guides/prepare-kml-kmz-files-upload',
    isPolygon: true,
  },
  {
    template: TemplateByFile.PointShapeFile,
    Icon: () => <ImgIcon src={ShapeFileIcon} alt="Shapefile Icon" />,
    title: 'Point Shapefile',
    bestForText:
      'If you have sourcing locations defined via coordinates and want to analyze the area around them. Requires formatting in a GIS software such as QGIS.',
    requiredFieldsText: (
      <>
        <span>
          Your point shapefile must be in the EPSG-4326 WGS 84 projection. The following fields must
          be present in your polygon shapefile's attribute table:
        </span>
        <ul>
          <li>Location_N (Name of your locations)</li>
          <li>
            Analysis_R (radius value (KM) that will be used to determine the area of analysis around
            your coordinate. Only required if Analysis Area is not defined)
          </li>
          <li>
            Analysis_A (area value (HA) that will be used to determine the area of analysis around
            your coordinate. Only required if Analysis Radius is not defined)
          </li>
        </ul>
      </>
    ),
    filename: 'GFWPro-PointShapefile.zip',
    helpCenterLinkText: 'How to format point shape file data',
    helpCenterLinkUrl:
      'https://globalforestwatch.org/help/gfw-pro/guides/prepare-shapefiles-upload',
    isPolygon: false,
  },
  {
    template: TemplateByFile.PointGeoJson,
    Icon: () => <ImgIcon src={GeoJsonIcon} alt="GeoJson Icon" />,
    title: 'Point GeoJSON',
    bestForText:
      'If you have sourcing locations defined via a coordinate point and an analysis radius or area. Requires formatting in GIS software such as QGIS, or a code-editing software such as Studio Code.',
    requiredFieldsText: (
      <>
        <span>
          Your polygon GeoJSON must be in the EPSG-4326 WGS 84 projection. The following fields must
          be present in your GeoJSON file:
        </span>
        <ul>
          <li>Location Name (Name of your location)</li>
          <li>
            Analysis Radius (Radius value (KM) that will be used to determine the area of analysis
            around your coordinate. Only required if Analysis Area is not defined)
          </li>
          <li>
            Analysis Area (Area value (HA) that will be used to determine area of analysis around
            your coordinate. Only required if Analysis Radius is not defined)
          </li>
        </ul>
      </>
    ),
    filename: 'GFWPro-Point_GeoJSON.geojson',
    helpCenterLinkText: 'How to format GeoJSON data',
    helpCenterLinkUrl: 'https://globalforestwatch.org/help/gfw-pro/guides',
    isPolygon: false,
  },
  {
    template: TemplateByFile.PointSpreadsheet,
    Icon: Description,
    title: 'Point Spreadsheet',
    bestForText:
      'If you have sourcing locations defined via coordinates and want to analyze the area around them. Requires formatting in a spreadsheet editor.',
    requiredFieldsText: (
      <>
        <span>The following fields must be present in your spreadsheet:</span>
        <ul>
          <li>Location Name (Name of your locations)</li>
          <li>
            Latitude (latitude value of your coordinate data. Coordinate data must be in decimal
            degrees)
          </li>
          <li>
            Longitude (longitude value of your coordinate data. Coordinate data must be in decimal
            degrees)
          </li>
          <li>
            Analysis Radius (radius value (KM) that will be used to determine the area of analysis
            around your coordinate. Only required if Analysis Area is not defined)
          </li>
          <li>
            Analysis Area (area value (HA) that will be used to determine the area of analysis
            around your coordinate. Only required if Analysis Radius is not defined)
          </li>
        </ul>
      </>
    ),
    filename: 'GFWPro-Spreadsheet.csv',
    helpCenterLinkText: 'How to format spreadsheet data',
    helpCenterLinkUrl:
      'https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
    isPolygon: false,
  },
];

const templateOptionsById = [
  {
    template: TemplateById.CAR,
    Icon: Description,
    title: 'CAR ID Spreadsheet',
    bestForText: (
      <>
        If you wish to upload a list of CAR IDs (as defined in{' '}
        <a target="_window" href="https://www.car.gov.br/#/">
          Cadastro Ambiental Rural database
        </a>
        ). Requires formatting in a spreadsheet editor.
      </>
    ),
    requiredFieldsText: (
      <>
        <span>
          The following fields must be present in your file:
          <ul>
            <li>Location Name (Name of your locations)</li>
            <li>ID System (use value "CAR" for all locations)</li>
            <li>ID (ID value as defined in Cadastro Ambiental Rural database).</li>
          </ul>
        </span>
        <div>*Remember to include one location ID per row</div>
      </>
    ),
    filename: 'GFWPro-CARIDs.xlsx',
    helpCenterLinkText: 'How to format CAR IDs for upload into GFW Pro',
    helpCenterLinkUrl:
      'https://www.globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
    isPolygon: false,
  },
  {
    template: TemplateById.UML,
    Icon: Description,
    title: 'Palm Oil Mill ID Spreadsheet',
    bestForText: (
      <>
        If you wish to upload a list of palm oil mills identified in the{' '}
        <a
          target="_window"
          href="https://data.globalforestwatch.org/documents/gfw::universal-mill-list/about"
        >
          Universal Mill List
        </a>
        . Requires formatting in a spreadsheet editor.
      </>
    ),
    requiredFieldsText: (
      <>
        <span>
          The following fields must be present in your file:
          <ul>
            <li>Location Name (Name of your locations)</li>
            <li>Palm Mill ID (Palm Mill ID as defined in the Universal Mill List)</li>
            <li>
              Analysis Radius (radius value (KM) that will be used to determine the area of analysis
              around your coordinate. Only required if Analysis Area is not defined)
            </li>
            <li>
              Analysis Area (area value (HA) that will be used to determine the area of analysis
              around your coordinate. Only required if Analysis Radius is not defined)
            </li>
          </ul>
        </span>
      </>
    ),
    filename: 'GFWPro-PalmMillIDs.csv',
    helpCenterLinkText: 'How to format spreadsheet data',
    helpCenterLinkUrl:
      'https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template',
    isPolygon: false,
  },
];
