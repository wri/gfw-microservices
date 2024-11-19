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
import { HowToFormatLocationLink } from '../components/HowToFormatLocationLink';
import { PillButton } from '../../../../../components';
import {
  Close,
  Download,
  DownloadDone,
  SvgIconComponent,
  Timeline,
  Public,
} from '@mui/icons-material';

type DataTemplatesProps = {
  handleClose: () => void;
};

const style: SxProps = {
  display: 'flex',
  flexDirection: 'column',
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '870px',
  height: '750px',
  bgcolor: 'background.paper',
  borderRadius: '4px',
  boxShadow: 24,
  padding: 3,
  paddingTop: 2,
};

enum Template {
  PolygonShapeFile,
  Kml,
  Spreadsheet,
  PointShapeFile,
  ListOfPalmMillIds,
}

const templateOptions: {
  template: Template;
  Icon: SvgIconComponent;
  title: string;
  bestForText: string;
  requiredFieldsText: string;
}[] = [
  {
    template: Template.PointShapeFile,
    Icon: Timeline,
    title: 'Polygon Shapefile',
    bestForText:
      'If you have sourcing locations in polygon format. Requires using a text editor such as Notepad++',
    requiredFieldsText:
      'The following required fields must be included in your file upload. Location_N  (Name of your locations)',
  },
  {
    template: Template.Kml,
    Icon: Public,
    title: 'KML',
    bestForText:
      'If you have sourcing locations in polygon format. Requires using a text editor such as Notepad++',
    requiredFieldsText:
      'The following required fields must be included in your file upload. Location_N  (Name of your locations)',
  },
];

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
    <Box sx={style}>
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
        <HowToFormatLocationLink text="How to format your location data for GFW Pro" url="#" />
        <HowToFormatLocationLink text="Learn more about GFW Pro templates" url="#" />
      </Box>

      <Box
        sx={{ mt: 6, mx: 'auto', width: '600px', display: 'flex', flexDirection: 'column', gap: 1 }}
      >
        {templateOptions.map(({ title, Icon, template, bestForText }) => {
          const isSelected = selectedTemplate === template;
          const isHovered = hoveredTemplate === template;

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
                {isHovered && !isSelected && (
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
                {isSelected && (
                  <>
                    {!downloadedTemplates.includes(template) ? (
                      <PillButton
                        variant="contained"
                        startIcon={<Download />}
                        sx={{ ml: 'auto' }}
                        onClick={(e) => handleDownloadTemplate(e, template)}
                      >
                        <Typography variant="caption">Download</Typography>
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
                }}
              >
                {bestForText}
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
