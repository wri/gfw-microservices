import React, { useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  IconButton,
  SxProps,
  Typography,
  useTheme,
} from '@mui/material';
import { ExternalHelperResource } from '../components/ExternalHelperResource';
import { PillButton } from '../../../../../components';
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

type DataTemplatesProps = {
  handleClose: () => void;
};

enum Template {
  PolygonShapeFile,
  Kml,
  Spreadsheet,
  PointShapeFile,
  ListOfPalmMillIds,
}

export function DataTemplates({ handleClose }: DataTemplatesProps) {
  const theme = useTheme();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [hoveredTemplate, setHoveredTemplate] = useState<Template | null>(null);
  const [downloadedTemplates, setDownloadedTemplates] = useState<Template[]>([]);

  const handleSelectTemplate = (template: Template) => {
    setSelectedTemplate((prev) => (prev === template ? null : template));
  };

  const handleDownloadTemplate = (e: React.MouseEvent<HTMLButtonElement>, template: Template) => {
    e.stopPropagation();
    setDownloadedTemplates((prev) => [...prev, template]);
  };
  const isAtLeastOneItemDownloaded = downloadedTemplates.length === 0;

  return (
    <Box sx={mainContainerStyle}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="h6">Download a template</Typography>
        <IconButton onClick={handleClose}>
          <Close fontSize="medium" />
        </IconButton>
      </Box>
      <Typography
        variant="caption"
        color={theme.palette.text.secondary}
        sx={{ marginTop: 2, marginBottom: 3 }}
      >
        Select a data type to view details and download a template. Use the template to format yours
        data, then upload into GFW Pro.
      </Typography>
      <Box sx={{ display: 'flex', gap: 3 }}>
        <ExternalHelperResource text="How to format your location data for GFW Pro" url="#" />
        <ExternalHelperResource text="Learn more about GFW Pro templates" url="#" />
      </Box>

      <Box
        sx={{ mt: 6, mx: 'auto', width: '600px', display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {templateOptions.map(({ title, Icon, template, bestForText, requiredFieldsText }) => {
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
                        onClick={(e) => handleDownloadTemplate(e, template)}
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
                <Box sx={{ ml: 4, maxWidth: '460px' }}>
                  <Box sx={{ display: 'flex', gap: 7 }}>
                    <Box sx={{ flex: '1' }}>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mb: 1.5, fontWeight: 'medium' }}
                      >
                        Best for
                      </Typography>
                      <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}
                        sx={{ display: 'block', textAlign: 'justify' }}
                      >
                        {bestForText}
                      </Typography>
                    </Box>
                    <Box sx={{ flex: '1' }}>
                      <Typography
                        variant="caption"
                        sx={{ display: 'block', mb: 1.5, fontWeight: 'medium' }}
                      >
                        Required fields
                      </Typography>
                      <Typography
                        variant="caption"
                        color={theme.palette.text.secondary}
                        sx={{ display: 'block', textAlign: 'justify' }}
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
                <ExternalHelperResource text="How to format shapefile data" url="#" />
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>

      <PillButton
        onClick={handleClose}
        variant="contained"
        color="info"
        startIcon={isAtLeastOneItemDownloaded ? <Close /> : null}
        sx={{ alignSelf: 'end', mt: 'auto' }}
      >
        {isAtLeastOneItemDownloaded ? 'Cancel' : 'Done'}
      </PillButton>
    </Box>
  );
}

const mainContainerStyle: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '870px',
  height: '800px',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  padding: 3,
  paddingTop: 2,
};

const templateOptions: {
  template: Template;
  Icon: SvgIconComponent;
  title: string;
  bestForText: string;
  requiredFieldsText: string;
}[] = [
  {
    template: Template.PolygonShapeFile,
    Icon: Timeline,
    title: 'Polygon Shapefile',
    bestForText:
      'If you have sourcing locations with explicit boundaries. Requires formatting in a GIS software such as QGIS.',
    requiredFieldsText:
      "Your polygon shapefile must be in the EPSG-4326 WGS 84 projection. The following field must be present in your polygon shapefile's attribute table: - Location_N (Name of your locations) You may also include additional fields of your choice (whatever numerical or text fields are helpful for you to have available when viewing your location data in Pro)",
  },
  {
    template: Template.Kml,
    Icon: Public,
    title: 'KML',
    bestForText:
      'Best for: If you have sourcing locations with explicit boundaries. This format is often used in conjunction with Google Earth, since Earth exports in KML format. Requires formatting in a text editor such as Notepad++',
    requiredFieldsText:
      'The following fields must be present in your KML file: - Location Name (Name of your locations) You may also include additional fields of your choice (whatever numerical or text fields are helpful for you to have available when viewing your location data in Pro)',
  },
  {
    template: Template.Spreadsheet,
    Icon: Description,
    title: 'Spreadsheet',
    bestForText:
      'If you have sourcing locations defined via coordinates and want to analyze the area around them. Requires formatting in a spreadsheet editor.',
    requiredFieldsText:
      'The following fields must be present in your spreadsheet: - Location Name (Name of your locations) - Latitude (latitude value of your coordinate data. Coordinate data must be in decimal degrees) - Longitude (longitude value of your coordinate data. Coordinate data must be in decimal degrees) - Analysis Radius (radius value (KM) that will be used to determine the area of analysis around your coordinate. Only required if Analysis Area is not defined) - Analysis Area (area value (HA) that will be used to determine the area of analysis around your coordinate. Only required it Analysis Radius is not defined) You may also include additional fields of your choice (whatever numerical or text fields are helpful for you to have available when viewing your location data in Pro)',
  },
  {
    template: Template.PointShapeFile,
    Icon: ScatterPlotTwoTone,
    title: 'Point Shapefile',
    bestForText:
      'If you have sourcing locations defined via coordinates and want to analyse the area around them. Requires formatting in a GIS software such as QGIS.',
    requiredFieldsText:
      "Your point shapefile must be in the EPSG-4326 WGS 84 projection. The following fields must be present in your polygon shapefile's attribute table: - Location_N (Name of your locations) - Analysis_R (radius value (KM) that will be used to determine the area of analysis around your coordinate. Only required if Analysis Area is not defined) - Analysis_A (area value (HA) that will be used to determine the area of analysis around your coordinate. Only required it Analysis Radius is not defined) You may also include additional fields of your choice (whatever numerical or text fields are helpful for you to have available when viewing your location data in Pro)",
  },
  {
    template: Template.ListOfPalmMillIds,
    Icon: OilBarrel,
    title: 'List of Palm Mill IDs',
    bestForText:
      'If you wish to upload a list of palm oil mills identified in the Universal Mill List. Requires formatting in a spreadsheet editor.',
    requiredFieldsText:
      'The following fields must be present in your  - Location Name (Name of your locations) - Palm Mill ID (Palm Mill ID as defined in the Universal Mill List - Analysis Radius (radius value (KM) that will be used to determine the area of analysis around your coordinate. Only required if Analysis Area is not defined) - Analysis Area (area value (HA) that will be used to determine the area of analysis around your coordinate. Only required it Analysis Radius is not defined) You may also include additional fields of your choice (whatever numerical or text fields are helpful for you to have available when viewing your location data in Pro)',
  },
];
