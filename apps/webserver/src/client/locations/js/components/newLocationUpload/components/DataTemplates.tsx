import './DataTemplates.scss';
import { ReactElement, useState, MouseEvent } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Dialog,
  DialogActions,
  DialogContent,
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
  OilBarrel,
  Public,
  ScatterPlotTwoTone,
  SvgIconComponent,
  Timeline,
} from '@mui/icons-material';

import { ExternalHelperResource, PillButton } from '../../../../../components';
import { aws_templates } from '../../../../../common/js/config';

type DataTemplatesProps = {
  isOpen: boolean;
  onClose: () => void;
};

enum Template {
  PolygonShapeFile,
  Kml,
  Spreadsheet,
  PointShapeFile,
  ListOfPalmMillIds,
}

export function DataTemplates({ isOpen, onClose }: DataTemplatesProps) {
  const theme = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<Template | null>(null);
  const [downloadedTemplates, setDownloadedTemplates] = useState<Template[]>([]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate((prev) => (prev === template ? null : template));
  };

  const handleDownloadTemplate = (
    e: MouseEvent<HTMLButtonElement>,
    template: Template,
    filename: string
  ) => {
    e.stopPropagation();

    window.open(`${aws_templates}${filename}`);
    setDownloadedTemplates((prev) => [...prev, template]);
  };

  const isAtLeastOneItemDownloaded = downloadedTemplates.length === 0;

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
          maxWidth: '850px',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          pt: 2,
          px: 3,
          pb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Download a template</Typography>
          <IconButton onClick={onClose}>
            <Close fontSize="medium" />
          </IconButton>
        </Box>
        <Typography variant="caption" color={theme.palette.text.secondary}>
          Select a data type to view details and download a template. Use the template to format
          your data, then upload into GFW Pro.
        </Typography>
        <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
          <ExternalHelperResource
            text="How to format your location data for GFW Pro"
            url="https://globalforestwatch.org/help/gfw-pro/guides/complete-selected-template"
          />
          <ExternalHelperResource
            text="Learn more about GFW Pro templates"
            url="https://globalforestwatch.org/help/gfw-pro/guides/select-correct-template"
          />
        </Box>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {templateOptions.map(
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
                  disableGutters
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
                    sx={{ backgroundColor: isSelected ? theme.palette.primary.light : 'none' }}
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
                    <ExternalHelperResource text={helpCenterLinkText} url={helpCenterLinkUrl} />
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
            startIcon={isAtLeastOneItemDownloaded ? <Close /> : null}
            sx={{ alignSelf: 'end', mt: 'auto' }}
          >
            {isAtLeastOneItemDownloaded ? 'Cancel' : 'Done'}
          </PillButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}

const templateOptions: {
  template: Template;
  Icon: SvgIconComponent;
  title: string;
  bestForText: string | ReactElement;
  requiredFieldsText: ReactElement;
  filename: string;
  helpCenterLinkText: string;
  helpCenterLinkUrl: string;
}[] = [
  {
    template: Template.PolygonShapeFile,
    Icon: Timeline,
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
  },
  {
    template: Template.Kml,
    Icon: Public,
    title: 'KML',
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
  },
  {
    template: Template.Spreadsheet,
    Icon: Description,
    title: 'Spreadsheet',
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
    helpCenterLinkUrl: 'https://globalforestwatch.org/help/gfw-pro/guides/select-correct-template',
  },
  {
    template: Template.PointShapeFile,
    Icon: ScatterPlotTwoTone,
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
  },
  {
    template: Template.ListOfPalmMillIds,
    Icon: OilBarrel,
    title: 'List of Palm Mill IDs',
    bestForText: (
      <>
        <span>If you wish to upload a list of palm oil mills identified in the</span>{' '}
        <a
          href="https://data.globalforestwatch.org/documents/gfw::universal-mill-list/about"
          target="_blank"
        >
          Universal Mill List
        </a>
        <span>.</span> <span>Requires formatting in a spreadsheet editor.</span>
      </>
    ),
    requiredFieldsText: (
      <>
        <span>The following fields must be present in your file:</span>
        <ul className="data-templates-required-fields-text">
          <li>Location Name (Name of your locations)</li>
          <li>
            Palm Mill ID (Palm Mill ID as defined in the {''}
            <a
              href="https://data.globalforestwatch.org/documents/gfw::universal-mill-list/about"
              target="_blank"
            >
              Universal Mill List)
            </a>
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
    filename: 'GFWPro-PalmMillIDs.csv',
    helpCenterLinkText: 'How to format a list palm mill IDs',
    helpCenterLinkUrl: 'https://globalforestwatch.org/help/gfw-pro/guides/upload-locations-lists',
  },
];
