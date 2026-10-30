/**
 * Local translations for the splash page (GFW Pro retirement notice).
 *
 * The splash page is intentionally self-contained: unlike the main app it does
 * not load Transifex Live, so every user-facing string is translated through
 * this map. Keys are the English source strings as they appear in Splash.jsx;
 * missing entries (or missing languages) fall back to the English key.
 */
export const SPLASH_TRANSLATIONS = {
  'Previously GFW Pro': {
    es: 'Anteriormente GFW Pro',
    pt: 'Anteriormente GFW Pro',
  },
  'Need help? Contact us →': {
    es: '¿Necesitas ayuda? Contáctanos →',
    pt: 'Precisa de ajuda? Entre em contato →',
  },
  'Product retired · December 31, 2026': {
    es: 'Producto retirado · 31 de diciembre de 2026',
    pt: 'Produto descontinuado · 31 de dezembro de 2026',
  },
  'GFW Pro has closed': {
    es: 'GFW Pro ha cerrado',
    pt: 'O GFW Pro foi encerrado',
  },
  'As part of the': {
    es: 'Como parte de la',
    pt: 'Como parte da',
  },
  'evolution of Global Forest Watch to Global Nature Watch (GNW)': {
    es: 'evolución de Global Forest Watch a Global Nature Watch (GNW)',
    pt: 'evolução do Global Forest Watch para o Global Nature Watch (GNW)',
  },
  ", we are consolidating our product suite to provide a more unified platform for monitoring and protecting the world's forests and nature. We are also expanding GNW to serve many of the core needs GFW Pro supports today.":
    {
      es: ', estamos consolidando nuestro portafolio de productos para ofrecer una plataforma más unificada para el monitoreo y la protección de los bosques y la naturaleza del mundo. También estamos ampliando GNW para atender muchas de las necesidades principales que GFW Pro cubre hoy.',
      pt: ', estamos consolidando nosso portfólio de produtos para oferecer uma plataforma mais unificada para o monitoramento e a proteção das florestas e da natureza do mundo. Também estamos expandindo o GNW para atender a muitas das principais necessidades que o GFW Pro suporta hoje.',
    },
  'Explore two pathways': {
    es: 'Explora dos caminos',
    pt: 'Explore dois caminhos',
  },
  'Additional resources': {
    es: 'Recursos adicionales',
    pt: 'Recursos adicionais',
  },
  'Web-based map & monitoring': {
    es: 'Mapa y monitoreo basados en web',
    pt: 'Mapa e monitoramento baseados na web',
  },
  'Go to GNW Horizon (preview mode)': {
    es: 'Ir a GNW Horizon (modo de vista previa)',
    pt: 'Ir para o GNW Horizon (modo de pré-visualização)',
  },
  'Dashboards for monitoring natural forest loss and more, plus AI-enabled features that help you interpret data, select the right datasets for you and generate custom charts.':
    {
      es: 'Paneles para monitorear la pérdida de bosque natural y más, además de funciones con IA que te ayudan a interpretar los datos, seleccionar los conjuntos de datos adecuados para ti y generar gráficos personalizados.',
      pt: 'Painéis para monitorar a perda de floresta natural e muito mais, além de recursos com IA que ajudam você a interpretar dados, selecionar os conjuntos de dados certos para você e gerar gráficos personalizados.',
    },
  'Open-source data & programmatic access': {
    es: 'Datos de código abierto y acceso programático',
    pt: 'Dados de código aberto e acesso programático',
  },
  'Access GNW self-hosted monitoring (SHM) datasets': {
    es: 'Accede a los conjuntos de datos de monitoreo autohospedado (SHM) de GNW',
    pt: 'Acesse os conjuntos de dados de monitoramento auto-hospedado (SHM) do GNW',
  },
  "Download and integrate GNW's supply chain-oriented open data directly — tree cover loss, natural forest, integrated forest alerts, GHG emissions and more.":
    {
      es: 'Descarga e integra directamente los datos abiertos de GNW orientados a cadenas de suministro: pérdida de cobertura arbórea, bosque natural, alertas integradas de perturbación forestal, emisiones de GEI y más.',
      pt: 'Baixe e integre diretamente os dados abertos do GNW orientados a cadeias de suprimentos: perda de cobertura florestal, floresta natural, alertas integrados de perturbação florestal, emissões de GEE e mais.',
    },
  'Access data & documentation →': {
    es: 'Acceder a datos y documentación →',
    pt: 'Acessar dados e documentação →',
  },
  Announcement: {
    es: 'Anuncio',
    pt: 'Anúncio',
  },
  'Read the full announcement': {
    es: 'Lee el anuncio completo',
    pt: 'Leia o anúncio completo',
  },
  "What's changing, what data has migrated and everything you need to know about the transition to GNW.":
    {
      es: 'Qué está cambiando, qué datos se han migrado y todo lo que necesitas saber sobre la transición a GNW.',
      pt: 'O que está mudando, quais dados foram migrados e tudo o que você precisa saber sobre a transição para o GNW.',
    },
  'Read the announcement →': {
    es: 'Leer el anuncio →',
    pt: 'Ler o anúncio →',
  },
  Support: {
    es: 'Soporte',
    pt: 'Suporte',
  },
  'Get help': {
    es: 'Obtener ayuda',
    pt: 'Obter ajuda',
  },
  'Get answers to questions about your data, subscriptions and how to get set up on the new platform.':
    {
      es: 'Obtén respuestas a preguntas sobre tus datos, suscripciones y cómo configurarte en la nueva plataforma.',
      pt: 'Obtenha respostas para perguntas sobre seus dados, assinaturas e como se configurar na nova plataforma.',
    },
  'Submit a support request →': {
    es: 'Enviar una solicitud de soporte →',
    pt: 'Enviar uma solicitação de suporte →',
  },
  'Privacy Policy': {
    es: 'Política de privacidad',
    pt: 'Política de privacidade',
  },
  'Terms of Use': {
    es: 'Términos de uso',
    pt: 'Termos de uso',
  },
};

/**
 * Languages offered by the splash page toggle. Labels are shown in their own
 * language and are intentionally not translated.
 */
export const SPLASH_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
];
