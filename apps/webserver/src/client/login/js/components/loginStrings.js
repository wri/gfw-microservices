// Image imports
import iconCompliance from '../../images/icon-lg-compliance.svg';
import iconMonitor from '../../images/icon-lg-monitor.svg';
import iconShare from '../../images/icon-lg-share.svg';
import photoAlexandra from '../../images/headshot_alexandra_experton.jpg';
import photoBanker from '../../images/banker.jpg';
import photoConsumerGoods from '../../images/consumer-goods.jpg';
import photoKarimah from '../../images/headshot_karimah_hudda.jpg';
import photoLuiz from '../../images/headshot_luiz_gabriel_todt_de_azevedo.jpg';
import photoMoray from '../../images/headshot_moray_mcleish.jpg';
import photoProducer from '../../images/producer.jpg';
import photoTrader from '../../images/trader.jpg';

const loginStrings = {
  appTitleText: 'Achieve supply chain sustainability with analytics that drive impact.',
  appRequestAccount: 'Request an Account',
  appLearnMore: 'Learn more about Pro',
  moreInfo: {
    help: {
      paragraphText: 'Find out how GFW Pro can help you and your organization.',
      buttonText: 'Contact us',
      link: 'https://gfwpro.zendesk.com/hc/en-us/requests/new?ticket_form_id=30920711977363',
    },
    subscribe: {
      paragraphText: 'Follow us on LinkedIn to see the latest news and updates from GFW Pro',
      buttonText: 'GFW LinkedIn page',
      link: 'https://www.linkedin.com/showcase/globalforestwatch/',
    },
  },
  latestResearchTitle: 'Latest Research and Insights',
  latestResearchArticles: [
    {
      title: "Save the Forests? There's an App for That.",
      credit: 'by Luiz Amaral and Andrew Steer, ',
      date: 'January 18, 2017',
      url: '',
    },
    {
      title: 'How fintech can help banks tackle deforestation',
      credit: 'by Luiz Amaral, ',
      date: 'March 28, 2017',
      url: '',
    },
  ],
  whyGfwPro: {
    title: 'Why Use Global Forest Watch Pro?',
    body: 'Global Forest Watch Pro is the industry-standard platform that makes the latest forest mapping technology and analysis accessible to commodity and finance professionals for analysis, monitoring and reporting.',
  },
  appFeatures: {
    title:
      'GFW Pro was designed with leading companies and financial institutions to translate geospatial data into actionable insights. Platform capabilities include:',
    features: [
      {
        text: 'Monitor conditions at farms, supply sheds or jurisdictions and track changes over time',
        image: iconShare,
      },
      {
        text: "Verify and demonstrate compliance with commitments and regulations like the European Union's deforestation regulation (EUDR).",
        image: iconMonitor,
      },
      {
        text: 'Share data and analyses across teams and the broader organization via secure workflows.',
        image: iconCompliance,
      },
    ],
  },
  actions: [
    {
      description: 'Why GFW Pro?',
      action: 'watch the video',
      requestDemo: false,
    },
    {
      description: 'Request a demo from the GFW Pro team',
      action: '',
      requestDemo: true,
    },
  ],
  quoteTitle: 'What people are saying about Global Forest Watch Pro',
  quotes: [
    {
      text:
        '“Minimizing environmental risks in our operations is a critical challenge. Illegal and unintended deforestation can violate ' +
        'local legislation, negatively affect financial performance, and present reputational risk to all parties. GFW Pro is on the leading ' +
        'edge of technology and data applications that will help us work with our clients to better identify and manage deforestation risk. ' +
        'That’s delivering positive impact for our clients, for the countries in our region, and for future generations.”',
      name: 'Luiz Gabriel Todt de Azevedo',
      organization: 'IDB Invest',
      title: 'Chief, Environmental, Social & Governance Division',
      image: photoLuiz,
    },
    {
      text: '“GFW Pro allows us to upload all our production areas, monitor them for deforestation on a day-to-day basis, and prioritize engagement accurately and efficiently. It’s a win-win.”',
      name: 'Moray McLeish',
      organization: 'Asia, Olam',
      title: 'Vice President, Corporate Responsibility and Sustainability',
      image: photoMoray,
    },
    {
      text: '“We’ve worked extensively with WRI’s advisory services to analyze forest impacts in our supply chains. GFW Pro will make these forest analyses easily accessible, allowing us to manage deforestation risks in our supply chains more efficiently. We are also excited to see WRI’s methods become more widely used.”',
      name: 'Alexandra Experton',
      organization: 'Cargill Agricultural Supply Chain - Asia Pacific',
      title: 'Supply Chain Sustainability Manager',
      image: photoAlexandra,
    },
    {
      text: '“Mondelēz International is committed to addressing deforestation in our key raw materials, by engaging suppliers and influencing sector wide change. It’s time for all of us in the industry to stop duplicating efforts and start collaborating on one tool that can help us all meet our commitments in a harmonized, consistent manner. GFW Pro is that tool.”',
      name: 'Karimah Hudda',
      organization: 'Mondelez International',
      title: 'Global Sustainability Lead',
      image: photoKarimah,
    },
  ],
  monitorSectionTitle: 'What can Global Forest Watch Pro do for you?',
  monitorSection: {
    title: '',
    subsections: [
      {
        id: 'banker',
        title: 'Banker',
        quote:
          '“Minimizing environmental risks in our operations is a critical challenge. Illegal and unintended deforestation can violate ' +
          'local legislation, negatively affect financial performance, and present reputational risk to all parties. GFW Pro is on the leading ' +
          'edge of technology and data applications that will help us work with our clients to better identify and manage deforestation risk. ' +
          'That’s delivering positive impact for our clients, for the countries in our region, and for future generations.”',
        image: photoBanker,
        quoteRef:
          'Luiz Gabriel Todt de Azevedo, Chief, Environmental, Social & Governance Division - IDB Invest',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio of your investment locations within GFW Pro and access tailored screenings based on the location type.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              'Discover compliance-related forest insights to assess risk and prioritize.',
          },
          {
            title: 'Collaborate',
            description:
              'Share forest risk assessments with and receive priority locations from colleagues through Pro.',
          },
          {
            title: 'Manage',
            description: 'Develop environmental plans to mitigate risks and monitor performance.',
          },
        ],
      },
      {
        id: 'producer',
        title: 'Producer',
        quote:
          '“GFW Pro allows us to upload all our production areas, monitor them for deforestation on a day-to-day basis, and prioritize engagement accurately and efficiently. It’s a win-win.”',
        image: photoProducer,
        quoteRef:
          'Moray McLeish, Vice President, Corporate Responsibility and Sustainability for Asia, Olam',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio of your productions areas (e.g. soy farms, palm oil concessions) in GFW Pro.',
          },
          {
            title: 'Analyze & Monitor',
            description: 'Monitor production areas for forest clearing or fire activity.',
          },
          {
            title: 'Collaborate',
            description:
              'Share assessments and progress towards mitigating forest clearance and fire activity with colleagues or buyers.',
          },
          {
            title: 'Manage',
            description:
              'Flag production areas with concerning clearance or fire activity to prioritize engagement and mitigation efforts.',
          },
        ],
      },
      {
        id: 'commodityTrader',
        title: 'Commodity Trader',
        quote:
          '“We’ve worked extensively with WRI’s advisory services to analyze forest impacts in our supply chains. GFW Pro will make ' +
          'these forest analyses easily accessible, allowing us to manage deforestation risks in our supply chains more efficiently. We are ' +
          'also excited to see WRI’s methods become more widely used.”',
        image: photoTrader,
        quoteRef:
          'Alexandra Experton, Supply Chain Sustainability Manager, Cargill Agricultural Supply Chain - Asia Pacific',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Create a portfolio within GFW Pro of production locations received from your suppliers.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              'Identify areas at risk within your supply chain and assess compliance with the EUDR or progress towards zero-deforestation commitments.',
          },
          {
            title: 'Collaborate',
            description:
              'Send aggregated risk and progress assessments to colleagues and generate reports for buyers. Integrate into due diligence processes for the EUDR.',
          },
          {
            title: 'Manage',
            description:
              'Identify priority areas in your supply chain for complying with the EUDR and adhering to zero-deforestation commitments.',
          },
        ],
      },
      {
        id: 'goodsManufacturer',
        title: 'Consumer Goods Manufacturer',
        quote:
          'Mondelēz International is committed to addressing deforestation in our key raw materials, by engaging suppliers and ' +
          'influencing sector wide change. It’s time for all of us in the industry to stop duplicating efforts and start collaborating on ' +
          'one tool that can help us all meet our commitments in a harmonized, consistent manner. GFW Pro is that tool.',
        image: photoConsumerGoods,
        quoteRef: 'Karimah Hudda, Global Sustainability Lead, Procurement, Mondelez International',
        descriptions: [
          {
            title: 'Upload & Save',
            description:
              'Upload and monitor production location portfolios received from suppliers.',
          },
          {
            title: 'Analyze & Monitor',
            description:
              "Identify areas at risk throughout your supply base and monitor compliance with EUDR and progress towards suppliers' zero-deforestation goals.",
          },
          {
            title: 'Collaborate',
            description:
              'Share portfolios and coordinate sourcing decisions across the organization. Integrate into due diligence processes for the EUDR.',
          },
          {
            title: 'Manage',
            description:
              'Identify areas for prioritization within your supply base to support zero-deforestation commitments.',
          },
        ],
      },
      // {
      //   title: 'Upload & Save',
      //   description: 'Upload and save thousands of your commodity sourcing and investment locations or select from locations provided by GFW.',
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Analyze',
      //   description: "Use cutting edge forest-related insights from satellite imagery and GFW's vast data partner network to analyze issues and opportunities.",
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Collaborate',
      //   description: 'Share secured data & insights with colleagues, suppliers, and customers through the platform.',
      //   role: '',
      //   quote: ''
      // }, {
      //   title: 'Decide',
      //   description: 'Prioritize locations for management actions to achieve internal policies or international commitments.',
      //   role: '',
      //   quote: ''
      // }
    ],
  },
  dataPartners: [
    'Our',
    'Data Partners',
    'ESRI',
    'Google',
    'University of Maryland',
    'IUCN',
    'WDPA',
    'NASA',
    'CartoDB',
    'USGS',
    'Transparent World',
    'Agrosatelite',
    'Ministry of Forestry Indonesia',
    'RSPO',
    'Guyra',
    'ESA',
    'UCLouvain',
    'UNEP-WCMC',
    'Geoscience Australia',
    'FUNAI Government of Canada',
    'Natural Resources Canada',
    'Earth Sciences Sector',
    'Geomatics Canada',
    'Ministry of Agriculture Republic of Congo',
    'El Observatorio del Desarrollo',
    'Universidad de Costa Rica',
    'LINZ',
    'COONAPIP',
    'Ministry of the Agriculture Indonesia',
    'IGBE',
    'INPE',
    'CIAT',
    'CGD',
    'Open Development Cambodia',
    'FoodReg',
  ],
};

export default loginStrings;
