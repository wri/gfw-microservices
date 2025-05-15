import { useEffect } from 'react';
import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle';
import 'swagger-ui-dist/swagger-ui.css';

export default function ApiDocs() {
  useEffect(() => {
    SwaggerUIBundle({
      url: 'api/profile/swagger',
      dom_id: '#swagger-ui',
      presets: [SwaggerUIBundle.presets.apis, SwaggerUIBundle.SwaggerUIStandalonePreset],
    });
  }, []);
  return <div id="swagger-ui"></div>;
}
