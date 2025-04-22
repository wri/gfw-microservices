import { AfiAnalysisByListId } from '@wri-monorepos/sql';

export const locationListData = [
  {
    list_id: 6013,
    'Location Name': 'LN1',
    Latitude: -2.3961,
    Longitude: 101.162858,
    'Analysis Radius': 50,
    'Analysis Area': 542407.8549788087,
    Commodity: 'Palm Oil',
    Country: 'Indonesia',
    State: 'Bengkulu',
    'Sub State': 'Mukomuko',
    gadmid: 'IDN.5.8',
    ErrorDetails: null,
    attributes:
      '{"Location Classification":"Supply Shed","Company ID":"n/a","ID":"PO1000008174","Volume":"0","Parent Company":"USAHA SAWIT MANDIRI","Supplier Name":"","Refinery Name":"","Second Supplier Name":"","Second Refinery Name":"","Verified?":"","Oil Type":"","RSPO Model":" ","Certification":"None","Direct FFB":"0","Other FFB":"0","Associated Smallholder FFB":"0","Independent Smallholder FFB":"0","Start Date":"","End Date":"","Time Horizon":"","Accuracy Rating of Location Entered":"0","Wind Barrier":"","Riparian Buffers":"","Buffer Zones":"","Alternative Mill Name":" ","Group Name":"SUPERVENTURE","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
    'Accuracy Rating of Location Entered': 0,
    'Alternative Mill Name': ' ',
    'Associated Smallholder FFB': 0,
    'Buffer Zones': '',
    Certification: 'None',
    'Company ID': 'n/a',
    'Direct FFB': 0,
    'End Date': '',
    flag_forma: 0,
    flag_general: 0,
    flag_glad: 0,
    flag_gran_chaco: 0,
    flag_terrai: 0,
    flag_viirs: 0,
    'Group Name': 'SUPERVENTURE',
    ID: 'PO1000008174',
    'Independent Smallholder FFB': 0,
    'Location Classification': 'Supply Shed',
    'Oil Type': '',
    'Other FFB': 0,
    'Parent Company': 'USAHA SAWIT MANDIRI',
    'Refinery Name': '',
    'Riparian Buffers': '',
    'RSPO Model': ' ',
    'Second Refinery Name': '',
    'Second Supplier Name': '',
    'Start Date': '',
    'Supplier Name': '',
    'Time Horizon': '',
    'Verified?': '',
    Volume: 0,
    'Wind Barrier': '',
    list_location_id: 3,
    analysis_list_id: 6013,
    template_id: 2,
    id: 3,
    location_id: 3,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":4409.6316,"2002":3964.8266,"2003":2557.2038,"2004":9433.2983,"2005":7865.8254,"2006":8100.5772,"2007":15471.0475,"2008":9792.4014,"2009":8955.7711,"2010":6486.0217,"2011":13380.5472,"2012":9371.2064,"2013":6463.8448,"2014":6440.1906,"2015":4243.9127,"2016":6437.8825,"2017":7556.0509,"2018":7583.9969,"2019":5550.5048,"2020":5101.5909,"2021":6451.7553,"2022":10169.8723,"2023":7061.5464}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":501.7686,"2002":2236.5893,"2003":956.6751,"2004":3892.2826,"2005":5118.8929,"2006":4003.6602,"2007":7420.0477,"2008":5441.8616,"2009":4022.2632,"2010":2471.9921,"2011":6724.4135,"2012":5866.8609,"2013":3020.9068,"2014":2977.2089,"2015":2059.2566,"2016":2547.4782,"2017":2419.0278,"2018":3629.8456,"2019":1770.6578,"2020":1933.2374,"2021":2943.8975,"2022":5347.7405,"2023":3189.1527}',
    tree_cover_loss_peat_yearly:
      '{"2001":1447.6814,"2002":2055.8248,"2003":1076.2752,"2004":3784.9843,"2005":4771.7641,"2006":4067.6137,"2007":7295.5784,"2008":4684.2807,"2009":3803.459,"2010":2412.194,"2011":5316.4183,"2012":4337.4191,"2013":2338.6226,"2014":2275.5161,"2015":1418.6895,"2016":1651.4577,"2017":1707.2136,"2018":2869.2653,"2019":1710.1047,"2020":922.8465,"2021":1906.1441,"2022":3797.6387,"2023":2176.4628}',
    tree_cover_loss_intact_forest_yearly:
      '{"2001":8.917,"2002":10.3011,"2003":11.5301,"2004":13.7595,"2005":7.6087,"2006":38.5162,"2007":88.6998,"2008":77.783,"2009":24.7499,"2010":44.3553,"2011":44.043,"2012":137.8219,"2013":58.3429,"2014":75.1743,"2015":23.9818,"2016":146.5914,"2017":126.4561,"2018":217.9318,"2019":177.9721,"2020":387.8365,"2021":537.9825,"2022":617.0093,"2023":216.7117}',
    tree_cover_loss_protected_areas_yearly:
      '{"2001":134.0686,"2002":39.6663,"2003":34.8975,"2004":158.4273,"2005":63.0338,"2006":172.1337,"2007":179.8804,"2008":73.0273,"2009":118.2989,"2010":160.9798,"2011":242.0066,"2012":239.9117,"2013":153.9817,"2014":311.1184,"2015":228.3161,"2016":778.5104,"2017":1134.3338,"2018":1019.0045,"2019":1082.665,"2020":1530.0101,"2021":1501.583,"2022":1494.9805,"2023":528.7679}',
    tree_cover_loss_sea_landcover_yearly:
      '{"Bare land":{"2001":225.403,"2002":171.0679,"2003":34.0441,"2004":119.5018,"2005":11.0671,"2006":58.4828,"2007":31.5093,"2008":41.9638,"2009":21.9027,"2010":7.5322,"2011":25.2113,"2012":19.4472,"2013":0.6917,"2014":6.3022,"2015":3.6123,"2016":10.6832,"2017":23.9806,"2018":17.8302,"2019":7.3786,"2020":9.8376,"2021":1.614,"2022":6.3021,"2023":9.6067},"Rubber plantation":{"2001":259.9908,"2002":161.5191,"2003":347.2593,"2004":2941.6366,"2005":4826.0163,"2006":2671.5656,"2007":1782.9252,"2008":1320.3733,"2009":1012.9968,"2010":964.8862,"2011":1733.6403,"2012":1160.2803,"2013":1629.7697,"2014":1355.9291,"2015":878.4512,"2016":1216.4865,"2017":1115.1557,"2018":686.8826,"2019":503.6328,"2020":444.8885,"2021":638.3904,"2022":1231.5038,"2023":784.2358},"Secondary forest":{"2001":798.0011,"2002":738.4775,"2003":805.3511,"2004":1863.1674,"2005":1060.0953,"2006":2173.6382,"2007":8286.8371,"2008":5737.183,"2009":4473.7232,"2010":2707.7309,"2011":6842.8241,"2012":5589.5931,"2013":3157.4918,"2014":3566.143,"2015":2511.8231,"2016":3384.9409,"2017":3616.4798,"2018":4540.7188,"2019":2394.7692,"2020":2582.8464,"2021":3510.1807,"2022":5894.9236,"2023":3568.962},"Agriculture":{"2001":123.9168,"2002":150.5247,"2003":146.2247,"2004":273.1836,"2005":229.0273,"2006":152.9945,"2007":170.9791,"2008":180.9771,"2009":180.2007,"2010":202.7249,"2011":321.3482,"2012":167.5919,"2013":116.8585,"2014":76.4171,"2015":35.2096,"2016":155.07,"2017":203.8027,"2018":140.8366,"2019":121.9253,"2020":101.3935,"2021":123.4662,"2022":157.4468,"2023":215.1861},"Oil palm plantation":{"2001":1669.6789,"2002":1430.6452,"2003":534.8281,"2004":1597.87,"2005":682.2951,"2006":1754.2721,"2007":2998.9137,"2008":1239.9554,"2009":1882.7924,"2010":1551.4281,"2011":1983.0521,"2012":987.8225,"2013":833.9852,"2014":490.5422,"2015":251.4229,"2016":406.6095,"2017":1163.2304,"2018":850.5196,"2019":1287.5074,"2020":388.9548,"2021":866.1498,"2022":1331.8849,"2023":1128.1694},"Swamp":{"2001":55.1787,"2002":16.3703,"2003":17.1384,"2004":9.2998,"2005":9.9142,"2006":12.8366,"2007":63.107,"2008":15.6039,"2009":37.5803,"2010":5.3804,"2011":115.9927,"2012":41.0471,"2013":3.8436,"2014":6.5342,"2015":7.5332,"2016":7.4554,"2017":7.9171,"2018":3.8434,"2019":4.3039,"2020":1.7679,"2021":13.4518,"2022":8.4552,"2023":5.3034},"Settlements":{"2001":63.0327,"2002":71.4107,"2003":28.8254,"2004":78.4056,"2005":24.3676,"2006":13.7596,"2007":57.0391,"2008":21.9851,"2009":20.5244,"2010":6.611,"2011":24.1369,"2012":16.9103,"2013":8.3789,"2014":10.3763,"2015":2.7673,"2016":16.8335,"2017":18.6785,"2018":11.6841,"2019":12.9137,"2020":46.1234,"2021":56.1167,"2022":36.0527,"2023":25.4434},"Grassland/shrub":{"2001":358.1829,"2002":548.0175,"2003":228.1999,"2004":756.2007,"2005":345.8639,"2006":316.5037,"2007":760.0689,"2008":424.8058,"2009":453.2349,"2010":291.9914,"2011":686.8289,"2012":301.3602,"2013":129.8951,"2014":260.4003,"2015":174.7781,"2016":296.5219,"2017":324.2704,"2018":334.03,"2019":221.8879,"2020":293.1319,"2021":212.9732,"2022":323.6591,"2023":251.1013},"Primary forest":{"2001":69.2655,"2002":21.5253,"2003":61.9606,"2004":58.4215,"2005":61.6538,"2006":252.3919,"2007":238.9254,"2008":76.2591,"2009":179.7274,"2010":241.0857,"2011":354.9955,"2012":447.1624,"2013":223.622,"2014":231.161,"2015":116.1553,"2016":370.7537,"2017":514.0653,"2018":522.359,"2019":554.5716,"2020":811.4015,"2021":678.414,"2022":845.2406,"2023":709.7715},"Water bodies":{"2001":14.0651,"2002":10.2226,"2003":6.4564,"2004":22.4442,"2005":21.2162,"2006":20.1401,"2007":37.2828,"2008":25.2915,"2009":14.6055,"2010":24.753,"2011":49.2766,"2012":14.2216,"2013":5.0732,"2014":7.9936,"2015":3.1514,"2016":4.6118,"2017":5.3033,"2018":6.533,"2019":6.3027,"2020":3.3049,"2021":1.6911,"2022":5.3035,"2023":5.9189},"Mixed tree crops":{"2001":772.9161,"2002":645.0458,"2003":346.8387,"2004":1711.3224,"2005":594.3084,"2006":673.9152,"2007":1042.845,"2008":707.6958,"2009":676.8687,"2010":480.8988,"2011":1241.2426,"2012":625.6929,"2013":354.235,"2014":428.0843,"2015":258.4703,"2016":567.3782,"2017":562.7059,"2018":468.068,"2019":435.2348,"2020":417.9406,"2021":348.8464,"2022":329.0231,"2023":357.6175}}',
    tree_cover_loss_idn_landcover_yearly:
      '{"Bare land":{"2001":17.2957,"2002":17.5257,"2003":24.907,"2004":144.3687,"2005":106.0131,"2006":102.5504,"2007":491.3648,"2008":471.2306,"2009":360.4543,"2010":182.878,"2011":1003.8545,"2012":748.4231,"2013":677.9453,"2014":745.2893,"2015":629.8111,"2016":853.2172,"2017":603.4623,"2018":227.396,"2019":144.7552,"2020":53.5031,"2021":134.9871,"2022":319.1025,"2023":97.9368},"Settlement":{"2001":19.4462,"2002":19.215,"2003":14.3734,"2004":32.6651,"2005":7.3789,"2006":8.6851,"2007":16.6019,"2008":9.9924,"2009":12.4513,"2010":6.3794,"2011":9.838,"2012":7.6856,"2013":1.768,"2014":6.8398,"2015":3.6123,"2016":5.6103,"2017":13.1424,"2018":11.8359,"2019":16.2173,"2020":15.7567,"2021":18.7535,"2022":12.0668,"2023":17.0622},"Secondary forest":{"2001":31.4399,"2002":28.9023,"2003":16.9888,"2004":11.5302,"2005":10.6839,"2006":24.8312,"2007":62.722,"2008":93.0105,"2009":71.7968,"2010":28.5966,"2011":48.7343,"2012":148.4368,"2013":195.0286,"2014":387.214,"2015":285.8163,"2016":343.4803,"2017":705.3964,"2018":1737.5489,"2019":621.3174,"2020":593.7859,"2021":1474.9873,"2022":2472.5285,"2023":1792.4827},"Agriculture":{"2001":1708.0825,"2002":1257.1482,"2003":925.8262,"2004":3647.2142,"2005":1983.577,"2006":2280.2894,"2007":5425.0669,"2008":3750.1713,"2009":3535.2052,"2010":2768.0465,"2011":6264.4654,"2012":4144.5473,"2013":1817.4441,"2014":2216.9699,"2015":1357.9533,"2016":2836.8771,"2017":3435.9004,"2018":2936.4854,"2019":2313.7865,"2020":2492.6288,"2021":2460.1557,"2022":3548.668,"2023":2445.5276},"Swamp":{"2001":60.1755,"2002":36.8196,"2003":44.8139,"2004":133.4553,"2005":82.9457,"2006":122.7674,"2007":340.0944,"2008":443.4116,"2009":279.4224,"2010":203.7885,"2011":605.0722,"2012":1266.4679,"2013":488.3042,"2014":473.0144,"2015":308.7327,"2016":411.5925,"2017":263.9126,"2018":290.2826,"2019":169.8957,"2020":141.9885,"2021":278.0601,"2022":737.1655,"2023":373.6144},"Grassland/shrub":{"2001":514.9094,"2002":288.9985,"2003":248.8815,"2004":935.004,"2005":495.5337,"2006":663.3675,"2007":1195.5988,"2008":803.6982,"2009":675.7778,"2010":578.5003,"2011":1250.7448,"2012":1096.5525,"2013":615.0879,"2014":705.0865,"2015":639.6639,"2016":1203.8266,"2017":808.7864,"2018":699.6326,"2019":476.1952,"2020":675.5209,"2021":512.0282,"2022":950.7821,"2023":745.0676},"Timber plantation":{"2001":3.3824,"2002":0.0,"2003":3.3824,"2004":22.2163,"2005":39.513,"2006":105.162,"2007":130.7608,"2008":75.3356,"2009":214.937,"2010":72.6447,"2011":120.921,"2012":96.0913,"2013":15.144,"2014":16.6815,"2015":18.4495,"2016":3.9974,"2017":7.9179,"2018":7.8411,"2019":17.604,"2020":7.918,"2021":2.5368,"2022":31.0567,"2023":29.8268},"Primary forest":{"2001":4.5357,"2002":3.6131,"2003":7.3024,"2004":12.8377,"2005":2.8444,"2006":41.8998,"2007":20.3723,"2008":14.4518,"2009":7.1491,"2010":7.1495,"2011":11.9921,"2012":57.0355,"2013":19.9864,"2014":41.0498,"2015":14.298,"2016":117.6146,"2017":237.7795,"2018":367.6943,"2019":410.8245,"2020":663.3565,"2021":624.7733,"2022":663.7705,"2023":200.6533},"Estate crop plantation":{"2001":2038.2977,"2002":2301.9973,"2003":1265.3478,"2004":4469.0258,"2005":5114.9665,"2006":4729.5007,"2007":7747.4929,"2008":4100.5805,"2009":3780.0514,"2010":2609.6727,"2011":4008.6535,"2012":1783.1344,"2013":2627.4482,"2014":1840.9742,"2015":983.0392,"2016":656.5937,"2017":1474.6033,"2018":1298.0554,"2019":1372.6837,"2020":453.8277,"2021":943.859,"2022":1428.5826,"2023":1353.61},"Body of water":{"2001":12.0666,"2002":10.607,"2003":5.3803,"2004":22.6751,"2005":22.3693,"2006":21.5238,"2007":40.5116,"2008":30.2115,"2009":16.8349,"2010":27.4434,"2011":54.5809,"2012":22.6013,"2013":5.6882,"2014":6.9175,"2015":2.0753,"2016":4.458,"2017":4.6885,"2018":6.3793,"2019":7.2252,"2020":3.3049,"2021":1.3068,"2022":6.149,"2023":5.5345}}',
    tree_cover_loss_idn_primary_forest_yearly: null,
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: null,
    tree_cover_loss_idn_forest_moratorium_yearly:
      '{"2001":562.1818,"2002":565.7167,"2003":578.9682,"2004":2053.0585,"2005":774.9844,"2006":1039.616,"2007":5162.3384,"2008":2348.0267,"2009":1706.468,"2010":1007.9347,"2011":2869.9728,"2012":2870.9803,"2013":1200.1731,"2014":1592.8365,"2015":1111.6121,"2016":1406.5616,"2017":1345.5218,"2018":2474.8504,"2019":1274.8322,"2020":1410.1202,"2021":2314.9424,"2022":3540.1318,"2023":1786.5153}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 485222.9388,
    tree_cover_extent_primary_forest: 291580.3258,
    tree_cover_extent_protected_areas: 210534.5883,
    tree_cover_extent_peat: 89249.7076,
    tree_cover_extent_intact_forest: 170613.9706,
    natural_habitat_primary: 291613.4582,
    natural_habitat_intact_forest: 170702.5237,
    natural_habitat_global_land_cover: null,
    total_area: 542407.2944,
    protected_areas_area: 215537.0002,
    critical_habitat_alliance_zero: null,
    indigenous_people_land_rights: null,
    peat_area: 102761.8843,
    fires_counts_monthly: null,
    soy_total_area: null,
    soy_pre2001_nonforest_area: null,
    brazil_biomes: '{}',
    idn_legal_area:
      '{"Protected Forest":8157.5027,"Sanctuary Reserves/Nature Conservation Area":184143.4379,"Production Forest":15453.5311,"Converted Production Forest":27828.5203,"Other Utilization Area":252081.9101,"Limited Production Forest":53124.2707}',
    sea_landcover_area:
      '{"Bare land":2235.1742,"Rubber plantation":48799.7134,"Secondary forest":145263.5725,"Agriculture":29127.1502,"Oil palm plantation":52893.7321,"Swamp":1671.5158,"Settlements":4637.8426,"Grassland/shrub":21182.961,"Primary forest":187765.6922,"Water bodies":6192.7961,"Mixed tree crops":42174.8005}',
    idn_landcover_area:
      '{"Bare land":9213.1365,"Settlement":6227.2588,"Secondary forest":36492.0926,"Agriculture":170379.6145,"Swamp":8828.2784,"Grassland/shrub":32185.6084,"Timber plantation":1181.1541,"Primary forest":179978.9405,"Estate crop plantation":91121.2428,"Body of water":6333.474}',
    idn_forest_moratorium_area: 227543.6799,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'true',
    indonesia_presence: 'true',
    commodity_threat_deforestation_level: null,
    commodity_threat_peat_level: null,
    commodity_threat_protected_areas_level: null,
    commodity_threat_fires_level: null,
    commodity_threat_overall_level: null,
    commodity_threat_overall_score: null,
    commodity_value_forest_extent_level: null,
    commodity_value_peat_level: null,
    commodity_value_protected_areas_level: null,
    commodity_value_overall_level: null,
    commodity_value_overall_score: null,
    commodity_value_forest_extent: null,
    commodity_value_peat: null,
    commodity_value_protected_areas: null,
    commodity_mill_priority_level: null,
    commodity_mill_priority_score: null,
    commodity_threat_deforestation: null,
    commodity_threat_peat: null,
    commodity_threat_protected_areas: null,
    commodity_threat_fires: null,
    dissolved_data_location_info: null,
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_yearly: null,
    country_specific_deforestation_wdpa_yearly: null,
    country_specific_deforestation_landmark_yearly: null,
    country_specific_deforestation_classified_region_yearly: null,
    tree_cover_loss_by_country_yearly: null,
    tree_cover_loss_by_country_wdpa_yearly: null,
    tree_cover_loss_by_country_landmark_yearly: null,
    country_area: null,
    classified_region_area: null,
    tree_cover_loss_by_country_classified_region_yearly: null,
    location_error: null,
    commodity_threat_deforestation_level_parsed: null,
    commodity_threat_peat_level_parsed: null,
    commodity_threat_protected_areas_level_parsed: null,
    commodity_threat_fires_level_parsed: null,
    commodity_value_forest_extent_level_parsed: null,
    commodity_value_peat_level_parsed: null,
    commodity_value_protected_areas_level_parsed: null,
    commodity_value_overall_level_parsed: null,
    commodity_threat_overall_level_parsed: null,
    commodity_mill_priority_level_parsed: null,
  },
  {
    list_id: 6013,
    'Location Name': 'LN2',
    Latitude: 17.00352,
    Longitude: 81.46973,
    'Analysis Radius': 50,
    'Analysis Area': 785078.8496491212,
    Commodity: 'Palm Oil',
    Country: 'India',
    State: 'Andhra Pradesh',
    'Sub State': 'West Godavari',
    gadmid: 'IND.2.12',
    ErrorDetails: null,
    attributes:
      '{"Location Classification":"Supply Shed","Company ID":"n/a","ID":"PO1000008590","Volume":"0","Parent Company":"3F OIL PALM AGROTECH","Supplier Name":"","Refinery Name":"","Second Supplier Name":"","Second Refinery Name":"","Verified?":"","Oil Type":"","RSPO Model":" ","Certification":"None","Direct FFB":"0","Other FFB":"0","Associated Smallholder FFB":"0","Independent Smallholder FFB":"0","Start Date":"","End Date":"","Time Horizon":"","Accuracy Rating of Location Entered":"0","Wind Barrier":"","Riparian Buffers":"","Buffer Zones":"","Alternative Mill Name":" ","Group Name":"UNKNOWN","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
    'Accuracy Rating of Location Entered': 0,
    'Alternative Mill Name': ' ',
    'Associated Smallholder FFB': 0,
    'Buffer Zones': '',
    Certification: 'None',
    'Company ID': 'n/a',
    'Direct FFB': 0,
    'End Date': '',
    flag_forma: 0,
    flag_general: 0,
    flag_glad: 0,
    flag_gran_chaco: 0,
    flag_terrai: 0,
    flag_viirs: 0,
    'Group Name': 'UNKNOWN',
    ID: 'PO1000008590',
    'Independent Smallholder FFB': 0,
    'Location Classification': 'Supply Shed',
    'Oil Type': '',
    'Other FFB': 0,
    'Parent Company': '3F OIL PALM AGROTECH',
    'Refinery Name': '',
    'Riparian Buffers': '',
    'RSPO Model': ' ',
    'Second Refinery Name': '',
    'Second Supplier Name': '',
    'Start Date': '',
    'Supplier Name': '',
    'Time Horizon': '',
    'Verified?': '',
    Volume: 0,
    'Wind Barrier': '',
    list_location_id: 2,
    analysis_list_id: 6013,
    template_id: 2,
    id: 2,
    location_id: 2,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":34.8819,"2002":52.7077,"2003":222.5335,"2004":152.1305,"2005":185.1305,"2006":99.4342,"2007":127.581,"2008":392.7892,"2009":336.6867,"2010":153.6398,"2011":945.387,"2012":418.3287,"2013":147.2443,"2014":203.213,"2015":155.416,"2016":108.5484,"2017":82.5418,"2018":65.8899,"2019":102.023,"2020":58.026,"2021":30.5268,"2022":33.7651,"2023":191.6575}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":0.3675,"2002":0.0,"2003":0.2205,"2004":0.294,"2005":1.1028,"2006":0.147,"2007":0.0735,"2008":0.0,"2009":0.0735,"2010":0.0735,"2011":0.147,"2012":0.441,"2013":0.0,"2014":0.1471,"2015":0.0735,"2016":0.0,"2017":0.2206,"2018":1.9111,"2019":4.4837,"2020":1.7641,"2021":1.8376,"2022":0.0735,"2023":0.8086}',
    tree_cover_loss_peat_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.1476,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0,"2023":0.0}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: null,
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: null,
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 97395.3482,
    tree_cover_extent_primary_forest: 4987.2845,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 49.1921,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 4988.3875,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: null,
    total_area: 785080.0959,
    protected_areas_area: 0,
    critical_habitat_alliance_zero: null,
    indigenous_people_land_rights: null,
    peat_area: 25946.8908,
    fires_counts_monthly: null,
    soy_total_area: null,
    soy_pre2001_nonforest_area: null,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level: null,
    commodity_threat_peat_level: null,
    commodity_threat_protected_areas_level: null,
    commodity_threat_fires_level: null,
    commodity_threat_overall_level: null,
    commodity_threat_overall_score: null,
    commodity_value_forest_extent_level: null,
    commodity_value_peat_level: null,
    commodity_value_protected_areas_level: null,
    commodity_value_overall_level: null,
    commodity_value_overall_score: null,
    commodity_value_forest_extent: null,
    commodity_value_peat: null,
    commodity_value_protected_areas: null,
    commodity_mill_priority_level: null,
    commodity_mill_priority_score: null,
    commodity_threat_deforestation: null,
    commodity_threat_peat: null,
    commodity_threat_protected_areas: null,
    commodity_threat_fires: null,
    dissolved_data_location_info: null,
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_yearly: null,
    country_specific_deforestation_wdpa_yearly: null,
    country_specific_deforestation_landmark_yearly: null,
    country_specific_deforestation_classified_region_yearly: null,
    tree_cover_loss_by_country_yearly: null,
    tree_cover_loss_by_country_wdpa_yearly: null,
    tree_cover_loss_by_country_landmark_yearly: null,
    country_area: null,
    classified_region_area: null,
    tree_cover_loss_by_country_classified_region_yearly: null,
    location_error: null,
    commodity_threat_deforestation_level_parsed: null,
    commodity_threat_peat_level_parsed: null,
    commodity_threat_protected_areas_level_parsed: null,
    commodity_threat_fires_level_parsed: null,
    commodity_value_forest_extent_level_parsed: null,
    commodity_value_peat_level_parsed: null,
    commodity_value_protected_areas_level_parsed: null,
    commodity_value_overall_level_parsed: null,
    commodity_threat_overall_level_parsed: null,
    commodity_mill_priority_level_parsed: null,
  },
  {
    list_id: 6013,
    'Location Name': 'LN3',
    Latitude: 4.286556,
    Longitude: -72.13408,
    'Analysis Radius': 50,
    'Analysis Area': 785078.9300344483,
    Commodity: 'Palm Oil',
    Country: 'Colombia',
    State: 'Meta',
    'Sub State': 'Puerto Gaitán',
    gadmid: 'COL.20.18',
    ErrorDetails: null,
    attributes:
      '{"Location Classification":"Supply Shed","Company ID":"n/a","ID":"PO1000008347","Volume":"0","Parent Company":"ABAGO S.A.S.","Supplier Name":"","Refinery Name":"","Second Supplier Name":"","Second Refinery Name":"","Verified?":"","Oil Type":"","RSPO Model":" ","Certification":"None","Direct FFB":"0","Other FFB":"0","Associated Smallholder FFB":"0","Independent Smallholder FFB":"0","Start Date":"","End Date":"","Time Horizon":"","Accuracy Rating of Location Entered":"0","Wind Barrier":"","Riparian Buffers":"","Buffer Zones":"","Alternative Mill Name":"BRAGANZA","Group Name":"UNKNOWN","flag_general":"0","flag_gran_chaco":"0","flag_glad":"0","flag_forma":"0","flag_viirs":"0","flag_terrai":"0"}',
    'Accuracy Rating of Location Entered': 0,
    'Alternative Mill Name': 'BRAGANZA',
    'Associated Smallholder FFB': 0,
    'Buffer Zones': '',
    Certification: 'None',
    'Company ID': 'n/a',
    'Direct FFB': 0,
    'End Date': '',
    flag_forma: 0,
    flag_general: 0,
    flag_glad: 0,
    flag_gran_chaco: 0,
    flag_terrai: 0,
    flag_viirs: 0,
    'Group Name': 'UNKNOWN',
    ID: 'PO1000008347',
    'Independent Smallholder FFB': 0,
    'Location Classification': 'Supply Shed',
    'Oil Type': '',
    'Other FFB': 0,
    'Parent Company': 'ABAGO S.A.S.',
    'Refinery Name': '',
    'Riparian Buffers': '',
    'RSPO Model': ' ',
    'Second Refinery Name': '',
    'Second Supplier Name': '',
    'Start Date': '',
    'Supplier Name': '',
    'Time Horizon': '',
    'Verified?': '',
    Volume: 0,
    'Wind Barrier': '',
    list_location_id: 1,
    analysis_list_id: 6013,
    template_id: 2,
    id: 1,
    location_id: 1,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":76.792,"2002":174.5471,"2003":64.8823,"2004":95.5681,"2005":76.3228,"2006":207.6284,"2007":223.5149,"2008":212.2199,"2009":221.8848,"2010":125.8056,"2011":120.1161,"2012":220.2249,"2013":58.834,"2014":67.1925,"2015":84.6031,"2016":272.7063,"2017":205.427,"2018":109.3073,"2019":114.6868,"2020":118.3606,"2021":377.7269,"2022":523.453,"2023":205.0538}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":3.2985,"2002":9.2029,"2003":7.439,"2004":8.2827,"2005":11.0446,"2006":38.8066,"2007":26.9189,"2008":49.7716,"2009":31.8271,"2010":26.8458,"2011":12.2705,"2012":21.8585,"2013":6.2124,"2014":18.1012,"2015":6.9035,"2016":50.0097,"2017":24.7748,"2018":11.8126,"2019":23.786,"2020":18.7165,"2021":24.7712,"2022":7.5938,"2023":7.2096}',
    tree_cover_loss_peat_yearly:
      '{"2001":5.6762,"2002":24.6929,"2003":5.5984,"2004":9.4338,"2005":7.44,"2006":13.8054,"2007":8.5892,"2008":26.0765,"2009":14.8029,"2010":8.7443,"2011":17.8694,"2012":33.9774,"2013":7.2101,"2014":19.7131,"2015":14.3428,"2016":56.9861,"2017":33.134,"2018":31.6029,"2019":11.5816,"2020":20.0952,"2021":18.714,"2022":29.3781,"2023":35.7374}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly:
      '{"2001":0.8436,"2002":0.4602,"2003":1.0736,"2004":20.0152,"2005":8.2057,"2006":43.3277,"2007":27.4544,"2008":1.9173,"2009":1.9179,"2010":6.5188,"2011":1.9176,"2012":1.4572,"2013":0.2301,"2014":0.1534,"2015":0.0,"2016":0.0,"2017":0.2301,"2018":0.0,"2019":0.9974,"2020":5.0627,"2021":3.912,"2022":0.3068,"2023":0.0}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: null,
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: null,
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 107719.9714,
    tree_cover_extent_primary_forest: 14746.6586,
    tree_cover_extent_protected_areas: 1646.9457,
    tree_cover_extent_peat: 12831.9184,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 14820.6039,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: null,
    total_area: 785079.2842,
    protected_areas_area: 10771.8179,
    critical_habitat_alliance_zero: null,
    indigenous_people_land_rights: null,
    peat_area: 74191.9982,
    fires_counts_monthly: null,
    soy_total_area: null,
    soy_pre2001_nonforest_area: null,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level: null,
    commodity_threat_peat_level: null,
    commodity_threat_protected_areas_level: null,
    commodity_threat_fires_level: null,
    commodity_threat_overall_level: null,
    commodity_threat_overall_score: null,
    commodity_value_forest_extent_level: null,
    commodity_value_peat_level: null,
    commodity_value_protected_areas_level: null,
    commodity_value_overall_level: null,
    commodity_value_overall_score: null,
    commodity_value_forest_extent: null,
    commodity_value_peat: null,
    commodity_value_protected_areas: null,
    commodity_mill_priority_level: null,
    commodity_mill_priority_score: null,
    commodity_threat_deforestation: null,
    commodity_threat_peat: null,
    commodity_threat_protected_areas: null,
    commodity_threat_fires: null,
    dissolved_data_location_info: null,
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_yearly: null,
    country_specific_deforestation_wdpa_yearly: null,
    country_specific_deforestation_landmark_yearly: null,
    country_specific_deforestation_classified_region_yearly: null,
    tree_cover_loss_by_country_yearly: null,
    tree_cover_loss_by_country_wdpa_yearly: null,
    tree_cover_loss_by_country_landmark_yearly: null,
    country_area: null,
    classified_region_area: null,
    tree_cover_loss_by_country_classified_region_yearly: null,
    location_error: null,
    commodity_threat_deforestation_level_parsed: null,
    commodity_threat_peat_level_parsed: null,
    commodity_threat_protected_areas_level_parsed: null,
    commodity_threat_fires_level_parsed: null,
    commodity_value_forest_extent_level_parsed: null,
    commodity_value_peat_level_parsed: null,
    commodity_value_protected_areas_level_parsed: null,
    commodity_value_overall_level_parsed: null,
    commodity_threat_overall_level_parsed: null,
    commodity_mill_priority_level_parsed: null,
  },
];

export const afiLocationLevelData = [
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: 2,
    gadmId: null,
    coverageHA: 742.2031451586759,
    naturalForestLossHA: 8.743208131482211,
    totalAreaHA: 1256.1646821446757,
    negligibleRisk: 100,
    statusCode: 2,
    locationError: null,
    locationName: 'L1',
    country: 'Brazil',
    state: 'Amazonas',
    subState: 'Lábrea',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: 3,
    gadmId: null,
    coverageHA: 251.69314385190685,
    naturalForestLossHA: 90.35210599890917,
    totalAreaHA: 1256.4203696590005,
    negligibleRisk: 100,
    statusCode: 2,
    locationError: null,
    locationName: 'L3',
    country: 'Brazil',
    state: 'Acre',
    subState: 'Porto Acre',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: 1,
    gadmId: null,
    coverageHA: 419.6845973241104,
    naturalForestLossHA: 13.769003244052165,
    totalAreaHA: 1256.217339121448,
    negligibleRisk: 100,
    statusCode: 2,
    locationError: null,
    locationName: 'L2',
    country: 'Brazil',
    state: 'Amazonas',
    subState: 'Lábrea',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
] as AfiAnalysisByListId[];

export const afiListLevelData = [
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: -1,
    gadmId: 'BRA.1.14',
    coverageHA: 176.82835752141645,
    naturalForestLossHA: 57.551127668932544,
    totalAreaHA: 782.2518775502366,
    protectedAreasArea: 0,
    landmarkArea: 0,
    statusCode: 2,
    locationError: null,
    negligibleRisk: 100,
    country: 'Brazil',
    state: 'Acre',
    subState: 'Porto Acre',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: -1,
    gadmId: 'BRA.4.13',
    coverageHA: 74.8647863304904,
    naturalForestLossHA: 32.800978329976616,
    totalAreaHA: 474.1684921087639,
    protectedAreasArea: 0,
    landmarkArea: 0,
    statusCode: 2,
    locationError: null,
    negligibleRisk: 100,
    country: 'Brazil',
    state: 'Amazonas',
    subState: 'Boca do Acre',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationId: -1,
    gadmId: 'BRA.4.34',
    coverageHA: 1161.887742482786,
    naturalForestLossHA: 22.512211375534378,
    totalAreaHA: 2512.3820212661235,
    protectedAreasArea: 0,
    landmarkArea: 0,
    statusCode: 2,
    locationError: null,
    negligibleRisk: 100,
    country: 'Brazil',
    state: 'Amazonas',
    subState: 'Lábrea',
    jrcForestLossByYear: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
    naturalForestLossByYear: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
] as AfiAnalysisByListId[];

export const argentinaLocationData = [
  {
    list_id: 5692,
    'Location Name': 'arg3 landmark',
    Latitude: -29.8,
    Longitude: -60.2,
    'Analysis Radius': 1,
    'Analysis Area': 313.7819203125,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Argentina',
    State: 'Santa Fe',
    'Sub State': 'Vera',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'ARG.21.19',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 3,
    analysis_list_id: 5692,
    template_id: 13,
    id: 3,
    location_id: 3,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.6697,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_primary_forest_yearly: '{}',
    tree_cover_loss_peat_yearly: '{}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 34.1578,
    tree_cover_extent_primary_forest: 0,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 0,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 0,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 313.0648 }',
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 0,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level: '{}',
    commodity_threat_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_score:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_score:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent:
      '{"2002":5.0232,"2003":5.0232,"2004":5.0232,"2005":5.0232,"2006":5.0232,"2007":5.0232,"2008":5.0232,"2009":5.0232,"2010":5.0232,"2011":5.0232,"2012":5.0232,"2013":5.0232,"2014":5.0232,"2015":4.6883,"2016":4.6883,"2017":4.6883,"2018":4.6883,"2019":4.6883,"2020":4.6883,"2021":4.6883}',
    commodity_value_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_mill_priority_score:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_threat_deforestation:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.3349,"2014":0.3349,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires: '{}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly:
      '{"Category II": {"2008": 0.0, "2009": 0.0, "2010": 0.0, "2011": 0.0, "2012": 0.0, "2013": 0.6697, "2014": 0.0, "2015": 0.0, "2016": 0.0, "2017": 0.0, "2018": 0.0, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}}',
    arg_otbn_area: '{"Category II":32.8851, "Category I, Category IV":32.8851}',
    argentina_presence: 'true',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{"Not Reported":313.0648}',
    country_specific_deforestation_classified_region_yearly: '{"ARG":{"Category II":{}}}',
    country_specific_deforestation_wdpa_yearly: '{"ARG":{}}',
    country_specific_deforestation_landmark_yearly: '{"ARG":{"Not Reported":{}}}',
    country_specific_deforestation_yearly: '{"ARG":{}}',
  },
  {
    list_id: 5692,
    'Location Name': 'arg4 wdpa',
    Latitude: -27.04,
    Longitude: -65.85,
    'Analysis Radius': 4,
    'Analysis Area': 5025.13535234375,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Argentina',
    State: 'Tucumán',
    'Sub State': 'Monteros',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'ARG.24.11',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 6,
    analysis_list_id: 5692,
    template_id: 13,
    id: 6,
    location_id: 6,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.4122,"2004":0.1374,"2005":0.0687,"2006":0.0,"2007":0.0687,"2008":0.2061,"2009":0.0687,"2010":0.0,"2011":0.6183,"2012":0.4123,"2013":0.0687,"2014":0.0,"2015":0.0,"2016":0.0687,"2017":0.3436,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_primary_forest_yearly: '{}',
    tree_cover_loss_peat_yearly: '{}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.1374,"2004":0.0,"2005":0.0687,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0687,"2012":0.4123,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0687,"2017":0.3436,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 1821.1013,
    tree_cover_extent_primary_forest: 0,
    tree_cover_extent_protected_areas: 769.3343,
    tree_cover_extent_peat: 0,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 0,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 5025.2067 }',
    protected_areas_area: 1777.9713,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 0,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level: '{}',
    commodity_threat_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_score:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_protected_areas_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent:
      '{"2002":315.2689,"2003":315.2689,"2004":315.2689,"2005":315.2689,"2006":315.2689,"2007":315.2002,"2008":315.2002,"2009":315.2002,"2010":315.2002,"2011":315.2002,"2012":315.2002,"2013":314.9941,"2014":314.5817,"2015":314.5817,"2016":314.5817,"2017":314.5817,"2018":314.5817,"2019":314.4443,"2020":314.4443,"2021":314.4443}',
    commodity_value_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_protected_areas:
      '{"2002":1777.9713,"2003":1777.9713,"2004":1777.9713,"2005":1777.9713,"2006":1777.9713,"2007":1777.9713,"2008":1777.9713,"2009":1777.9713,"2010":1777.9713,"2011":1777.9713,"2012":1777.9713,"2013":1777.9713,"2014":1777.9713,"2015":1777.9713,"2016":1777.9713,"2017":1777.9713,"2018":1777.9713,"2019":1777.9713,"2020":1777.9713,"2021":1777.9713}',
    commodity_mill_priority_level:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_mill_priority_score:
      '{"2006": 1, "2013": 1, "2017": 1, "2015": 1, "2010": 1, "2009": 1, "2005": 1, "2008": 1, "2020": 1, "2011": 1, "2019": 1, "2018": 1, "2002": 1, "2016": 1, "2003": 1, "2007": 1, "2014": 1, "2004": 1, "2012": 1}',
    commodity_threat_deforestation:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0687,"2006":0.0687,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.2061,"2012":0.6184,"2013":0.4123,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.1374,"2018":0.1374,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0687,"2006":0.0687,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.4123,"2013":0.4123,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.1374,"2018":0.1374,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires: '{}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly:
      '{"Category I": {"2008": 0.0, "2009": 0.0687, "2010": 0.0, "2011": 0.4809, "2012": 0.4123, "2013": 0.0687, "2014": 0.0, "2015": 0.0, "2016": 0.0, "2017": 0.3436, "2018": 0.0, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}}',
    arg_otbn_area: '{"Category I":1921.3536}',
    argentina_presence: 'true',
    protected_areas_by_category_area:
      '{"Category Ia":1620.7222,"Category II":156.9743,"Category VI":0.2748}',
    landmark_by_category_area: '{"Not Reported":909.8068}',
    country_specific_deforestation_classified_region_yearly:
      '{"ARG":{"Category III":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":4679.3454,"2012":0.0,"2013approx":2262.6501,"2014":34.5098,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}}}',
    country_specific_deforestation_wdpa_yearly: '{"ARG":{}}',
    country_specific_deforestation_landmark_yearly:
      '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":1572.3204,"2012":0.0,"2013approx":854.8599,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}}}',
    country_specific_deforestation_yearly:
      '{"ARG":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":4684.0759,"2012":0.0,"2013approx":2267.5881,"2014":34.5098,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}}',
  },
  {
    list_id: 5692,
    'Location Name': 'arg5',
    Latitude: -35,
    Longitude: -65,
    'Analysis Radius': 1,
    'Analysis Area': 313.7819189453125,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Argentina',
    State: 'La Pampa',
    'Sub State': 'Rancul',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'ARG.11.18',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 2,
    analysis_list_id: 5692,
    template_id: 13,
    id: 2,
    location_id: 2,
    location_status_id: 2,
    tree_cover_loss_total_yearly: '{}',
    tree_cover_loss_primary_forest_yearly: '{}',
    tree_cover_loss_peat_yearly: '{}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 0.0633,
    tree_cover_extent_primary_forest: 0,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 0,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 0,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 314.2081 }',
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 0,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level: '{}',
    commodity_threat_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_score:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_score:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_mill_priority_score:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_threat_deforestation:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires: '{}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{"Category I": {}, "Category II": {}}',
    arg_otbn_area:
      '{"Category I":114.319,"Category II":98.4859, "Category III":98.4859, "Category IV":98.4859, "Category V":98.4859}',
    argentina_presence: 'true',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_classified_region_yearly: '{"ARG":{"Category II":{}}}',
    country_specific_deforestation_wdpa_yearly: '{"ARG":{"Category II":{}}}',
    country_specific_deforestation_landmark_yearly: '{"ARG":{"Not Reported":{}}}',
    country_specific_deforestation_yearly: '{"ARG":{}}',
  },
  {
    list_id: 5692,
    'Location Name': 'arg6 otbn',
    Latitude: -27.5,
    Longitude: -65.04,
    'Analysis Radius': 4,
    'Analysis Area': 5025.135350976563,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Argentina',
    State: 'Tucumán',
    'Sub State': 'Simoca',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'ARG.24.13',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 4,
    analysis_list_id: 5692,
    template_id: 13,
    id: 4,
    location_id: 4,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":17.5897,"2002":5.6121,"2003":4.517,"2004":0.1369,"2005":4.0376,"2006":1.8478,"2007":4.4481,"2008":17.9995,"2009":4.2432,"2010":6.2277,"2011":3.08,"2012":0.0684,"2013":120.725,"2014":12.8667,"2015":6.845,"2016":2.2589,"2017":2.9433,"2018":10.265,"2019":0.0,"2020":1.5742,"2021":0.0,"2022":0.0}',
    tree_cover_loss_primary_forest_yearly: '{}',
    tree_cover_loss_peat_yearly:
      '{"2001":2.6692,"2002":1.4373,"2003":0.8897,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.8212,"2008":0.1369,"2009":0.4791,"2010":0.0,"2011":0.4107,"2012":0.0684,"2013":18.2059,"2014":1.1635,"2015":0.0,"2016":0.4792,"2017":0.0685,"2018":0.2053,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0684,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 1144.3672,
    tree_cover_extent_primary_forest: 0,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 160.2304,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 0,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 5024.1901 }',
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 633.8753,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 1, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level: '{}',
    commodity_threat_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_score:
      '{"2002": 0.2, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 0, "2018": 0, "2019": 0, "2020": 1}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_score:
      '{"2002": 0.2, "2003": 0.2, "2004": 0.2, "2005": 0.2, "2006": 0.2, "2007": 0.2, "2008": 0.2, "2009": 0.2, "2010": 0.2, "2011": 0.2, "2012": 0.2, "2013": 0.2, "2014": 0.2, "2015": 0.2, "2016": 0.2, "2017": 0, "2018": 0, "2019": 0, "2020": 0.2}',
    commodity_value_forest_extent:
      '{"2002":85.6923,"2003":75.7679,"2004":71.6614,"2005":69.5398,"2006":69.4713,"2007":68.2395,"2008":67.1444,"2009":65.1599,"2010":53.9353,"2011":51.4715,"2012":47.8441,"2013":46.133,"2014":46.133,"2015":43.3269,"2016":43.0531,"2017":43.0531,"2018":42.5055,"2019":42.3001,"2020":42.3001,"2021":42.3001}',
    commodity_value_peat:
      '{"2002":633.8753,"2003":633.8753,"2004":633.8753,"2005":633.8753,"2006":633.8753,"2007":633.8753,"2008":633.8753,"2009":633.8753,"2010":633.8753,"2011":633.8753,"2012":633.8753,"2013":633.8753,"2014":633.8753,"2015":633.8753,"2016":633.8753,"2017":633.8753,"2018":633.8753,"2019":633.8753,"2020":633.8753,"2021":633.8753}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2006": 0, "2013": 0, "2017": 0, "2015": 0, "2010": 0, "2009": 0, "2005": 0, "2008": 0, "2020": 0, "2011": 0, "2019": 0, "2018": 0, "2002": 0, "2016": 0, "2003": 0, "2007": 0, "2014": 0, "2004": 0, "2012": 0}',
    commodity_mill_priority_score:
      '{"2006": 0.2, "2013": 0.2, "2017": 0, "2015": 0.2, "2010": 0.2, "2009": 0.2, "2005": 0.2, "2008": 0.2, "2020": 0.2, "2011": 0.2, "2019": 0, "2018": 0, "2002": 0.4, "2016": 0.2, "2003": 0.2, "2007": 0.2, "2014": 0.2, "2004": 0.2, "2012": 0.2}',
    commodity_threat_deforestation:
      '{"2002":14.0309,"2003":6.2281,"2004":2.19,"2005":1.3002,"2006":2.3269,"2007":3.0797,"2008":13.2091,"2009":13.6884,"2010":6.0912,"2011":5.3385,"2012":1.7111,"2013":2.8061,"2014":3.0799,"2015":0.2738,"2016":0.5476,"2017":0.753,"2018":0.2054,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_peat:
      '{"2002":2.6692,"2003":1.6426,"2004":0.2053,"2005":0.0,"2006":0.0,"2007":0.2053,"2008":0.2053,"2009":0.0684,"2010":0.0684,"2011":0.0684,"2012":0.0684,"2013":1.9164,"2014":1.9848,"2015":0.0684,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires: '{}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly:
      '{"Category I": {"2008": 0.9582, "2009": 0.2053, "2010": 0.4107, "2011": 0.2053, "2012": 0.0, "2013": 11.1552, "2014": 1.1635, "2015": 5.8868, "2016": 0.9583, "2017": 0.3423, "2018": 1.7108, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}, "Category II": {"2008": 0.2053, "2009": 0.0, "2010": 1.0949, "2011": 0.3422, "2012": 0.0, "2013": 67.2731, "2014": 4.3116, "2015": 0.1369, "2016": 0.8214, "2017": 0.3423, "2018": 7.6645, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}}',
    arg_otbn_area: '{"Category I":452.4914,"Category II":184.3696}',
    argentina_presence: 'true',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_classified_region_yearly:
      '{"ARG":{"Category II":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":714.7155},"Category III":{}}}',
    country_specific_deforestation_wdpa_yearly:
      '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":527.781}}}',
    country_specific_deforestation_landmark_yearly:
      '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":739.9427}}}',
    country_specific_deforestation_yearly:
      '{"ARG":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":739.9427}}',
  },
  {
    list_id: 5692,
    'Location Name': 'Brazil1',
    Latitude: -8.9,
    Longitude: -67,
    'Analysis Radius': 1,
    'Analysis Area': 313.78191977539063,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Brazil',
    State: 'Amazonas',
    'Sub State': 'Lábrea',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'BRA.4.34',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 1,
    analysis_list_id: 5692,
    template_id: 13,
    id: 1,
    location_id: 1,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":0.0,"2002":0.6082,"2003":6.9187,"2004":0.076,"2005":19.9195,"2006":16.0424,"2007":2.509,"2008":0.3802,"2009":0.8363,"2010":0.0,"2011":1.9008,"2012":0.6082,"2013":0.3801,"2014":1.2925,"2015":0.0,"2016":13.7614,"2017":13.1533,"2018":2.433,"2019":3.7255,"2020":0.076,"2021":1.5966,"2022":0.4562}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":0.0,"2002":0.1521,"2003":6.0063,"2004":0.076,"2005":17.2585,"2006":9.7318,"2007":2.509,"2008":0.2281,"2009":0.8363,"2010":0.0,"2011":0.9124,"2012":0.5322,"2013":0.3041,"2014":0.6843,"2015":0.0,"2016":13.0771,"2017":6.1584,"2018":1.2165,"2019":0.9884,"2020":0.076,"2021":0.9884,"2022":0.076}',
    tree_cover_loss_peat_yearly: '{}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":11.4045,"2010":0.0,"2011":0.0,"2012":0.0,"2013":8.3632,"2014":0.0,"2015":0.0,"2016":0.0,"2017":17.2588,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":9.6558,"2010":0.0,"2011":0.0,"2012":0.0,"2013":7.6789,"2014":0.0,"2015":0.0,"2016":0.0,"2017":17.2588,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_brazil_biomes_yearly:
      '{"Amazônia":{"2001":0.0,"2002":0.6082,"2003":6.9187,"2004":0.076,"2005":19.9195,"2006":16.0424,"2007":2.509,"2008":0.3802,"2009":0.8363,"2010":0.0,"2011":1.9008,"2012":0.6082,"2013":0.3801,"2014":1.2925,"2015":0.0,"2016":13.7614,"2017":13.1533,"2018":2.433,"2019":3.7255,"2020":0.076,"2021":1.5966,"2022":0.4562}}',
    tree_cover_extent_total: 305.2597,
    tree_cover_extent_primary_forest: 254.4714,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 0,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 254.4714,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 313.8511 }',
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 0,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{"Amazônia":313.8511}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'true',
    brazil_biomes_presence: 'true',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 0, "2010": 0, "2011": 1, "2012": 1, "2013": 0, "2014": 0, "2015": 0, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level: '{}',
    commodity_threat_overall_level:
      '{"2002": 0, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_threat_overall_score:
      '{"2002": 0, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 0, "2010": 0, "2011": 0.2, "2012": 0.2, "2013": 0, "2014": 0, "2015": 0, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent:
      '{"2002":275.912,"2003":275.912,"2004":275.6839,"2005":268.9173,"2006":268.8413,"2007":249.8342,"2008":236.757,"2009":234.248,"2010":233.8679,"2011":233.0315,"2012":233.0315,"2013":231.4349,"2014":230.8267,"2015":230.5986,"2016":229.6102,"2017":229.6102,"2018":216.457,"2019":205.8127,"2020":203.6078,"2021":201.3269}',
    commodity_value_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2006": 1, "2013": 0, "2017": 1, "2015": 0, "2010": 0, "2009": 0, "2005": 1, "2008": 1, "2020": 1, "2011": 0, "2019": 1, "2018": 1, "2002": 0, "2016": 1, "2003": 1, "2007": 1, "2014": 0, "2004": 1, "2012": 0}',
    commodity_mill_priority_score:
      '{"2006": 2, "2013": 1, "2017": 2, "2015": 1, "2010": 1, "2009": 1, "2005": 2, "2008": 2, "2020": 2, "2011": 1.2, "2019": 2, "2018": 2, "2002": 1, "2016": 2, "2003": 2, "2007": 2, "2014": 1, "2004": 2, "2012": 1.2}',
    commodity_threat_deforestation:
      '{"2002":0.2281,"2003":6.9947,"2004":6.8426,"2005":19.0832,"2006":32.0843,"2007":15.5862,"2008":2.8891,"2009":1.2165,"2010":0.8363,"2011":1.5966,"2012":2.2049,"2013":0.8363,"2014":1.2165,"2015":0.9884,"2016":13.1532,"2017":23.7975,"2018":12.8492,"2019":4.4858,"2020":2.3569,"2021":1.2925}',
    commodity_threat_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires: '{}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_classified_region_yearly:
      '{"ARG":{"Category I":{},"Category II":{}}}',
    country_specific_deforestation_wdpa_yearly: '{"ARG":{}}',
    country_specific_deforestation_landmark_yearly: '{"ARG":{}}',
    country_specific_deforestation_yearly: '{"ARG":{}}',
  },
  {
    list_id: 5692,
    'Location Name': 'brazil2',
    Latitude: -8.7,
    Longitude: -66.8,
    'Analysis Radius': 1,
    'Analysis Area': 313.78191977539063,
    Commodity: 'Cocoa',
    'Location Classification': 'Property',
    'Company ID': '',
    Volume: 0,
    'Owner Name': '',
    'Owner ID': '',
    'Company Name': '',
    'Supplier Name': '',
    'Facility Name': '',
    'Refinery Name': '',
    Certification: '',
    'Start Date': '',
    'End Date': '',
    'Time Horizon': '',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Brazil',
    State: 'Amazonas',
    'Sub State': 'Lábrea',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'BRA.4.34',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 5,
    analysis_list_id: 5692,
    template_id: 13,
    id: 5,
    location_id: 5,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":0.0,"2002":10.4975,"2003":4.488,"2004":5.3248,"2005":18.4086,"2006":47.0109,"2007":22.1363,"2008":0.8368,"2009":22.0601,"2010":11.6385,"2011":10.4215,"2012":11.5626,"2013":9.3566,"2014":0.1521,"2015":4.336,"2016":22.2884,"2017":0.2282,"2018":0.1521,"2019":0.7607,"2020":0.0761,"2021":0.0,"2022":0.1521}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":0.0,"2002":10.3453,"2003":4.1838,"2004":5.3248,"2005":17.2676,"2006":47.0109,"2007":22.1363,"2008":0.8368,"2009":22.0601,"2010":11.6385,"2011":10.4215,"2012":11.5626,"2013":9.3566,"2014":0.1521,"2015":4.336,"2016":22.2884,"2017":0.2282,"2018":0.1521,"2019":0.7607,"2020":0.0761,"2021":0.0,"2022":0.1521}',
    tree_cover_loss_peat_yearly: '{}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly: '{}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":9.2044,"2010":8.6718,"2011":6.6941,"2012":0.0,"2013":11.5626,"2014":0.0,"2015":2.5103,"2016":43.4358,"2017":0.0,"2018":0.0,"2019":2.5103,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly:
      '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":9.2044,"2010":8.6718,"2011":6.6941,"2012":0.0,"2013":11.5626,"2014":0.0,"2015":2.5103,"2016":43.4358,"2017":0.0,"2018":0.0,"2019":2.5103,"2020":0.0,"2021":0.0,"2022":0.0}',
    tree_cover_loss_brazil_biomes_yearly:
      '{"Amazônia":{"2001":0.0,"2002":10.4975,"2003":4.488,"2004":5.3248,"2005":18.4086,"2006":47.0109,"2007":22.1363,"2008":0.8368,"2009":22.0601,"2010":11.6385,"2011":10.4215,"2012":11.5626,"2013":9.3566,"2014":0.1521,"2015":4.336,"2016":22.2884,"2017":0.2282,"2018":0.1521,"2019":0.7607,"2020":0.0761,"2021":0.0,"2022":0.1521}}',
    tree_cover_extent_total: 313.7881,
    tree_cover_extent_primary_forest: 311.8864,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 0,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 311.8864,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    country_area: '{ "ARG": 314.0163 }',
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 0,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{"Amazônia":314.0163}',
    idn_legal_area: '{}',
    sea_landcover_area: '{}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'true',
    legal_amazon_presence: 'true',
    brazil_biomes_presence: 'true',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'false',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 2, "2020": 2}',
    commodity_threat_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 0, "2019": 1, "2020": 1}',
    commodity_threat_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 0, "2019": 1, "2020": 1}',
    commodity_value_forest_extent_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_peat_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent:
      '{"2002":312.8753,"2003":312.8753,"2004":302.3778,"2005":297.8898,"2006":292.565,"2007":274.5367,"2008":227.5258,"2009":205.3895,"2010":204.5527,"2011":182.4926,"2012":170.8541,"2013":160.4325,"2014":148.87,"2015":139.5134,"2016":139.3612,"2017":135.0252,"2018":112.7369,"2019":112.5086,"2020":112.3565,"2021":111.5958}',
    commodity_value_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2006": 1, "2013": 1, "2017": 1, "2015": 1, "2010": 1, "2009": 1, "2005": 1, "2008": 1, "2020": 1, "2011": 1, "2019": 1, "2018": 0, "2002": 1, "2016": 1, "2003": 1, "2007": 1, "2014": 1, "2004": 1, "2012": 1}',
    commodity_mill_priority_score:
      '{"2006": 2, "2013": 2, "2017": 2, "2015": 2, "2010": 2, "2009": 2, "2005": 2, "2008": 2, "2020": 2, "2011": 2, "2019": 2, "2018": 1, "2002": 2, "2016": 2, "2003": 2, "2007": 2, "2014": 2, "2004": 2, "2012": 2}',
    commodity_threat_deforestation:
      '{"2002":10.4975,"2003":14.9855,"2004":9.8128,"2005":23.3531,"2006":65.0392,"2007":69.1472,"2008":22.9731,"2009":22.8969,"2010":33.6987,"2011":22.0601,"2012":21.9841,"2013":20.9192,"2014":9.5088,"2015":4.4881,"2016":26.6244,"2017":22.5166,"2018":0.3804,"2019":0.9128,"2020":0.8368,"2021":0.0761}',
    commodity_threat_peat:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":2.0,"2020":2.0,"2021":0.0}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: '{}',
    landmark_by_category_area: '{}',
    country_specific_deforestation_classified_region_yearly: '{"ARG":{"Category I":{}}}',
    country_specific_deforestation_wdpa_yearly:
      '{"ARG":{"Category Ia":{},"Category VI":{},"Category II":{}}}',
    country_specific_deforestation_landmark_yearly: '{"ARG":{"Not Reported":{}}}',
    country_specific_deforestation_yearly: '{"ARG":{}}',
  },
];

export const argentinaListLevelData = {
  id: 5597,
  list_id: 5692,
  status_id: 2,
  analysis_success_count: 0,
  analysis_fail_count: 0,
  tree_cover_loss_total_yearly:
    '{"2001":17.5897,"2002":16.7178,"2003":16.3359,"2004":5.6751,"2005":42.4344,"2006":64.9011,"2007":29.1621,"2008":19.4225,"2009":27.2084,"2010":17.8662,"2011":16.0205,"2012":12.6516,"2013":131.2002,"2014":14.3113,"2015":11.181,"2016":38.3774,"2017":16.6684,"2018":12.8501,"2019":4.4862,"2020":1.7263,"2021":1.5966,"2022":0.6083}',
  tree_cover_loss_primary_forest_yearly:
    '{"2001":0.0,"2002":10.4974,"2003":10.1901,"2004":5.4008,"2005":34.5261,"2006":56.7427,"2007":24.6453,"2008":1.0649,"2009":22.8965,"2010":11.6385,"2011":11.3339,"2012":12.0948,"2013":9.6607,"2014":0.8364,"2015":4.336,"2016":35.3655,"2017":6.3867,"2018":1.3686,"2019":1.7491,"2020":0.1521,"2021":0.9884,"2022":0.2282}',
  tree_cover_loss_peat_yearly:
    '{"2001":2.6692,"2002":1.4373,"2003":0.8897,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.8212,"2008":0.1369,"2009":0.4791,"2010":0.0,"2011":0.4107,"2012":0.0684,"2013":18.2059,"2014":1.1635,"2015":0.0,"2016":0.4792,"2017":0.0685,"2018":0.2053,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
  tree_cover_loss_intact_forest_yearly: '{}',
  tree_cover_loss_protected_areas_yearly:
    '{"2001":0.0,"2002":0.0,"2003":0.1374,"2004":0.0,"2005":0.0687,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0687,"2012":0.4123,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0687,"2017":0.3436,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}',
  tree_cover_loss_sea_landcover_yearly: '{}',
  tree_cover_loss_idn_landcover_yearly: '{}',
  tree_cover_loss_idn_primary_forest_yearly: '{}',
  tree_cover_loss_soy_yearly:
    '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0684,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
  tree_cover_loss_idn_legal_yearly: '{}',
  tree_cover_loss_idn_forest_moratorium_yearly: '{}',
  tree_cover_loss_prodes_yearly:
    '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":20.6088,"2010":8.6718,"2011":6.6941,"2012":0.0,"2013":19.9258,"2014":0.0,"2015":2.5103,"2016":43.4358,"2017":17.2588,"2018":0.0,"2019":2.5103,"2020":0.0,"2021":0.0,"2022":0.0}',
  tree_cover_loss_prodes_wdpa_yearly: '{}',
  tree_cover_loss_prodes_primary_forest_yearly:
    '{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":18.8602,"2010":8.6718,"2011":6.6941,"2012":0.0,"2013":19.2415,"2014":0.0,"2015":2.5103,"2016":43.4358,"2017":17.2588,"2018":0.0,"2019":2.5103,"2020":0.0,"2021":0.0,"2022":0.0}',
  tree_cover_loss_brazil_biomes_yearly:
    '{"Amazônia":{"2001":0.0,"2002":11.1057,"2003":11.4067,"2004":5.4008,"2005":38.3281,"2006":63.0533,"2007":24.6453,"2008":1.2169,"2009":22.8965,"2010":11.6385,"2011":12.3223,"2012":12.1708,"2013":9.7368,"2014":1.4446,"2015":4.336,"2016":36.0498,"2017":13.3815,"2018":2.5851,"2019":4.4862,"2020":0.1521,"2021":1.5966,"2022":0.6083}}',
  tree_cover_extent_total: 3618.7374,
  tree_cover_extent_primary_forest: 566.3578,
  tree_cover_extent_protected_areas: 769.3343,
  tree_cover_extent_peat: 160.2304,
  tree_cover_extent_intact_forest: 0.0,
  natural_habitat_primary: 566.3578,
  natural_habitat_intact_forest: 0.0,
  natural_habitat_global_land_cover: '{}',
  country_area: '{ "ARG": 11304.5371 }',
  protected_areas_area: 1777.9713,
  critical_habitat_alliance_zero: 0.0,
  indigenous_people_land_rights: 0.0,
  peat_area: 633.8753,
  fires_counts_monthly: '{}',
  soy_total_area: '{}',
  soy_pre2001_nonforest_area: 0.0,
  brazil_biomes: '{"Amazônia":627.8674}',
  idn_legal_area: '{}',
  sea_landcover_area: '{}',
  idn_landcover_area: '{}',
  idn_forest_moratorium_area: 0.0,
  south_america_presence: 'true',
  legal_amazon_presence: 'true',
  brazil_biomes_presence: 'true',
  cerrado_biome_presence: 'false',
  southeast_asia_presence: 'false',
  indonesia_presence: 'false',
  commodity_threat_deforestation_level: '{}',
  commodity_threat_peat_level: '{}',
  commodity_threat_protected_areas_level: '{}',
  commodity_threat_fires_level: '{}',
  commodity_threat_overall_level: '{}',
  commodity_threat_overall_score: '{}',
  commodity_value_forest_extent_level: '{}',
  commodity_value_peat_level: '{}',
  commodity_value_protected_areas_level: '{}',
  commodity_value_overall_level: '{}',
  commodity_value_overall_score: '{}',
  commodity_value_forest_extent:
    '{"2002":994.7717,"2003":984.8472,"2004":970.0152,"2005":956.6389,"2006":951.1697,"2007":912.8337,"2008":851.6505,"2009":825.0207,"2010":812.5793,"2011":787.219,"2012":771.9531,"2013":758.0177,"2014":745.4346,"2015":732.7088,"2016":731.2945,"2017":726.9585,"2018":690.9694,"2019":679.7541,"2020":677.397,"2021":674.3554}',
  commodity_value_peat:
    '{"2002":633.8753,"2003":633.8753,"2004":633.8753,"2005":633.8753,"2006":633.8753,"2007":633.8753,"2008":633.8753,"2009":633.8753,"2010":633.8753,"2011":633.8753,"2012":633.8753,"2013":633.8753,"2014":633.8753,"2015":633.8753,"2016":633.8753,"2017":633.8753,"2018":633.8753,"2019":633.8753,"2020":633.8753,"2021":633.8753}',
  commodity_value_protected_areas:
    '{"2002":1777.9713,"2003":1777.9713,"2004":1777.9713,"2005":1777.9713,"2006":1777.9713,"2007":1777.9713,"2008":1777.9713,"2009":1777.9713,"2010":1777.9713,"2011":1777.9713,"2012":1777.9713,"2013":1777.9713,"2014":1777.9713,"2015":1777.9713,"2016":1777.9713,"2017":1777.9713,"2018":1777.9713,"2019":1777.9713,"2020":1777.9713,"2021":1777.9713}',
  commodity_mill_priority_level: '{}',
  commodity_mill_priority_score: '{}',
  commodity_threat_deforestation:
    '{"2002":24.7565,"2003":28.2083,"2004":18.8455,"2005":43.8052,"2006":99.5191,"2007":87.813,"2008":39.0713,"2009":37.8018,"2010":40.6262,"2011":29.2013,"2012":26.5185,"2013":25.3088,"2014":14.14,"2015":5.7503,"2016":40.3252,"2017":47.2045,"2018":13.5723,"2019":5.3987,"2020":3.1937,"2021":1.3686}',
  commodity_threat_peat:
    '{"2002":2.6692,"2003":1.6426,"2004":0.2053,"2005":0.0,"2006":0.0,"2007":0.2053,"2008":0.2053,"2009":0.0684,"2010":0.0684,"2011":0.0684,"2012":0.0684,"2013":1.9164,"2014":1.9848,"2015":0.0684,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
  commodity_threat_protected_areas:
    '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0687,"2006":0.0687,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.4123,"2013":0.4123,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.1374,"2018":0.1374,"2019":0.0,"2020":0.0,"2021":0.0}',
  commodity_threat_fires:
    '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":2.0,"2020":2.0,"2021":0.0}',
  dissolved_geom_object_key:
    's3://gfwpro-geotrellis-pre-data/latest/dissolved/fb5fc5edd6b54abda9a289d8e9efdb2c_20231024204828.geojson',
  tree_cover_loss_arg_otbn_yearly:
    '{"Category I": {"2008": 0.9582, "2009": 0.274, "2010": 0.4107, "2011": 0.6862, "2012": 0.4123, "2013": 11.2239, "2014": 1.1635, "2015": 5.8868, "2016": 0.9583, "2017": 0.6859, "2018": 1.7108, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}, "Category II": {"2008": 0.2053, "2009": 0.0, "2010": 1.0949, "2011": 0.3422, "2012": 0.0, "2013": 67.9428, "2014": 4.3116, "2015": 0.1369, "2016": 0.8214, "2017": 0.3423, "2018": 7.6645, "2019": 0.0, "2020": 0.0, "2021": 0.0, "2022": 0.0}}',
  arg_otbn_area: '{"Category I":2488.1641,"Category II":315.7406}',
  argentina_presence: 'true',
  protected_areas_by_category_area:
    '{"Category Ia":1620.7222,"Category II":156.9743,"Category VI, Category V":0.2748}',
  landmark_by_category_area: '{"Not Reported":1222.8716}',
  country_specific_deforestation_classified_region_yearly:
    '{"ARG":{"Category I":{},"Category II":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":714.7155},"Category III":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":4679.3454,"2012":0.0,"2013approx":2262.6501,"2014":34.5098,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":0.0}}}',
  country_specific_deforestation_wdpa_yearly:
    '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":527.781},"Category Ia":{},"Category VI":{},"Category II":{}},"BRA":{}}',
  country_specific_deforestation_landmark_yearly:
    '{"ARG":{"Not Reported":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":1572.3204,"2012":0.0,"2013approx":854.8599,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":739.9427}},"BRA":{}}',
  country_specific_deforestation_yearly:
    '{"ARG":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011approx":4684.0759,"2012":0.0,"2013approx":2267.5881,"2014":34.5098,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0,"2022":739.9427},"BRA":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":20.6088,"2010":8.6718,"2011":6.6941,"2012":0.0,"2013":19.9258,"2014":0.0,"2015":2.5103,"2016":43.4358,"2017":17.2588,"2018":0.0,"2019":2.4343,"2020":0.0,"2021":0.0,"2022":0.0}}',
};

export const commodityRiskData = [
  {
    list_id: 1172,
    'Location Name': 'id_1043',
    Latitude: 3.7,
    Longitude: 101.25,
    'Analysis Radius': 20,
    'Analysis Area': 125582.56402153321,
    Commodity: 'Palm Oil',
    'Location Classification': 'supply shed',
    'Company ID': 'WRI_19',
    Volume: 0,
    'Owner Name': null,
    'Owner ID': null,
    'Parent Company': 'Ulu Basir POM',
    'Supplier Name': 'Company1',
    'Facility Name': null,
    'Refinery Name': null,
    'Second Supplier Name': null,
    'Second Refinery Name': null,
    'Oil Type': 'Palm oil',
    'RSPO Model': null,
    Certification: 'No',
    'Start Date': '8/1/2017',
    'End Date': '8/1/2018',
    'Time Horizon': '1 year',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Malaysia',
    State: 'Perak',
    'Sub State': 'Batang Padang',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'MYS.9.1',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 18,
    analysis_list_id: 1172,
    template_id: 5,
    id: 18,
    location_id: 18,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":3166.6065,"2002":2776.5019,"2003":689.7805,"2004":2092.482,"2005":2597.7063,"2006":933.2325,"2007":2927.928,"2008":2403.654,"2009":4895.3394,"2010":2564.8833,"2011":1183.1545,"2012":2242.2866,"2013":3079.4329,"2014":3782.0311,"2015":1754.7115,"2016":2568.5985,"2017":3100.1211,"2018":3075.22,"2019":1196.6325,"2020":371.4896,"2021":693.3896}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":103.497,"2002":22.8784,"2003":77.5433,"2004":162.5253,"2005":466.1757,"2006":66.1038,"2007":205.9854,"2008":76.3186,"2009":158.6873,"2010":96.195,"2011":100.3399,"2012":210.4438,"2013":85.3769,"2014":271.2262,"2015":122.5147,"2016":25.1823,"2017":24.2602,"2018":25.1818,"2019":53.2111,"2020":31.4015,"2021":130.2012}',
    tree_cover_loss_peat_yearly:
      '{"2001":967.7702,"2002":502.7593,"2003":290.6532,"2004":1001.9322,"2005":1328.5324,"2006":510.2844,"2007":1253.1856,"2008":748.5866,"2009":1018.2746,"2010":998.6994,"2011":565.7759,"2012":885.0847,"2013":1391.0752,"2014":2276.5533,"2015":735.5281,"2016":1179.938,"2017":1144.7872,"2018":874.3975,"2019":300.7085,"2020":240.5191,"2021":377.7214}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly:
      '{"2001":4.2229,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":1.8427,"2008":3.6855,"2009":1.1517,"2010":0.0,"2011":0.0,"2012":5.2977,"2013":0.2303,"2014":4.1461,"2015":0.0,"2016":0.9213,"2017":0.0768,"2018":1.1517,"2019":7.8317,"2020":0.0,"2021":0.3071}',
    tree_cover_loss_sea_landcover_yearly:
      '{"Rubber plantation":{"2001":209.9692,"2002":71.7038,"2003":19.1155,"2004":98.9607,"2005":115.3106,"2006":22.8779,"2007":124.9838,"2008":387.0886,"2009":1472.6165,"2010":532.0118,"2011":160.6064,"2012":260.723,"2013":135.8902,"2014":185.5533,"2015":88.4365,"2016":199.8319,"2017":193.5385,"2018":64.873,"2019":41.6871,"2020":43.6841,"2021":106.7918},"Secondary forest":{"2001":39.3119,"2002":25.6436,"2003":0.9981,"2004":3.532,"2005":76.5479,"2006":10.8258,"2007":59.8037,"2008":78.6117,"2009":22.1101,"2010":30.0954,"2011":25.4862,"2012":101.1148,"2013":354.7163,"2014":288.7297,"2015":163.1988,"2016":45.2176,"2017":8.138,"2018":14.5106,"2019":48.4508,"2020":23.1876,"2021":129.4374},"Oil palm plantation":{"2001":2911.3371,"2002":2677.3887,"2003":669.0527,"2004":1902.6222,"2005":2303.8952,"2006":890.8536,"2007":2728.7075,"2008":1922.139,"2009":3336.7395,"2010":1993.0258,"2011":992.993,"2012":1874.6909,"2013":2583.913,"2014":3298.8424,"2015":1500.1588,"2016":2314.4132,"2017":2892.0725,"2018":2993.4564,"2019":1104.4218,"2020":303.4663,"2021":455.8553},"Agriculture":{"2001":5.9883,"2002":1.7659,"2003":0.6142,"2004":87.3671,"2005":101.9526,"2006":8.6752,"2007":14.4331,"2008":15.8147,"2009":63.8733,"2010":9.7502,"2011":4.0689,"2012":5.7578,"2013":4.9134,"2014":8.9056,"2015":2.9174,"2016":9.1359,"2017":6.3721,"2018":2.3799,"2019":2.0728,"2020":1.1516,"2021":1.3051}}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 114523.234,
    tree_cover_extent_primary_forest: 51297.7593,
    tree_cover_extent_protected_areas: 4902.8538,
    tree_cover_extent_peat: 73640.4916,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 51304.362,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    total_area: 125584.332,
    protected_areas_area: 4906.8463,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 78308.8929,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area:
      '{"Rubber plantation":9073.4494,"Secondary forest":53526.1774,"Oil palm plantation":60257.0823,"Agriculture":2727.6229}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'true',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 1, "2020": 0}',
    commodity_threat_fires_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_threat_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1.2, "2020": 1}',
    commodity_value_forest_extent_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 1, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_overall_score:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2.2, "2020": 2}',
    commodity_value_forest_extent:
      '{"2002":49440.6662,"2003":49418.7067,"2004":49407.6507,"2005":49407.2668,"2006":49393.6007,"2007":49317.438,"2008":49308.6086,"2009":49286.9595,"2010":49253.4087,"2011":49249.1862,"2012":49236.9035,"2013":49217.9434,"2014":49208.8065,"2015":49204.8907,"2016":48993.6279,"2017":48853.5351,"2018":48830.886,"2019":48825.0511,"2020":48818.0647,"2021":48773.9136}',
    commodity_value_peat:
      '{"2002":78308.8929,"2003":78308.8929,"2004":78308.8929,"2005":78308.8929,"2006":78308.8929,"2007":78308.8929,"2008":78308.8929,"2009":78308.8929,"2010":78308.8929,"2011":78308.8929,"2012":78308.8929,"2013":78308.8929,"2014":78308.8929,"2015":78308.8929,"2016":78308.8929,"2017":78308.8929,"2018":78308.8929,"2019":78308.8929,"2020":78308.8929,"2021":78308.8929}',
    commodity_value_protected_areas:
      '{"2002":4906.8463,"2003":4906.8463,"2004":4906.8463,"2005":4906.8463,"2006":4906.8463,"2007":4906.8463,"2008":4906.8463,"2009":4906.8463,"2010":4906.8463,"2011":4906.8463,"2012":4906.8463,"2013":4906.8463,"2014":4906.8463,"2015":4906.8463,"2016":4906.8463,"2017":4906.8463,"2018":4906.8463,"2019":4906.8463,"2020":4906.8463,"2021":4906.8463}',
    commodity_mill_priority_level:
      '{"2017": 1, "2004": 1, "2020": 1, "2010": 1, "2012": 1, "2013": 1, "2003": 1, "2007": 1, "2019": 2, "2008": 1, "2011": 1, "2002": 1, "2018": 1, "2006": 1, "2014": 1, "2009": 1, "2015": 1, "2005": 1, "2016": 1}',
    commodity_mill_priority_score:
      '{"2017": 3, "2004": 3, "2020": 3, "2010": 3, "2012": 3, "2013": 3, "2003": 3, "2007": 3, "2019": 3.4, "2008": 3, "2011": 3, "2002": 3, "2018": 3, "2006": 3, "2014": 3, "2009": 3, "2015": 3, "2005": 3, "2016": 3}',
    commodity_threat_deforestation:
      '{"2002":33.0155,"2003":11.4399,"2004":14.05,"2005":89.8288,"2006":84.9921,"2007":30.4785,"2008":55.1999,"2009":37.7733,"2010":16.5052,"2011":31.2428,"2012":28.097,"2013":13.0527,"2014":215.1786,"2015":351.3556,"2016":162.7419,"2017":28.484,"2018":12.8213,"2019":51.1375,"2020":66.4939,"2021":129.2851}',
    commodity_threat_peat:
      '{"2002":29110.0698,"2003":29089.953,"2004":29083.3501,"2005":29140.3198,"2006":29144.0051,"2007":29093.8693,"2008":29106.6926,"2009":29101.0105,"2010":29084.0412,"2011":29082.9663,"2012":29088.034,"2013":29090.9517,"2014":29131.7244,"2015":29142.3201,"2016":29106.0018,"2017":29094.792,"2018":29082.7361,"2019":29118.6717,"2020":29134.7966,"2021":29159.8216}',
    commodity_threat_protected_areas:
      '{"2002":81.6935,"2003":80.3114,"2004":80.3114,"2005":80.3114,"2006":80.3114,"2007":80.3882,"2008":80.3882,"2009":81.0025,"2010":81.0025,"2011":80.3114,"2012":80.3114,"2013":80.3882,"2014":84.3808,"2015":84.304,"2016":80.3114,"2017":80.3114,"2018":80.465,"2019":87.2985,"2020":87.145,"2021":80.6186}',
    commodity_threat_fires:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":2.5,"2020":3.0,"2021":0.5}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: null,
    landmark_category_area: null,
    landmark_by_category_area: '{}',
    draftNonOwner: false,
  },
  {
    list_id: 1172,
    'Location Name': 'id_1049',
    Latitude: 1.06043,
    Longitude: 101.24047,
    'Analysis Radius': 20,
    'Analysis Area': 125582.56400184937,
    Commodity: 'Palm Oil',
    'Location Classification': 'supply shed',
    'Company ID': 'WRI_20',
    Volume: 0,
    'Owner Name': null,
    'Owner ID': null,
    'Parent Company': 'Kandis (Kandis)',
    'Supplier Name': 'Company1',
    'Facility Name': null,
    'Refinery Name': null,
    'Second Supplier Name': null,
    'Second Refinery Name': null,
    'Oil Type': 'Palm oil',
    'RSPO Model': null,
    Certification: 'No',
    'Start Date': '8/1/2017',
    'End Date': '8/1/2018',
    'Time Horizon': '1 year',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Indonesia',
    State: 'Riau',
    'Sub State': 'Bengkalis',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'IDN.24.1',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 20,
    analysis_list_id: 1172,
    template_id: 5,
    id: 20,
    location_id: 20,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":1040.0164,"2002":1340.3723,"2003":757.955,"2004":2949.5155,"2005":5910.6535,"2006":6889.4306,"2007":2913.4469,"2008":2944.9074,"2009":3567.6487,"2010":2544.7674,"2011":761.491,"2012":3194.5975,"2013":2706.3367,"2014":3780.1395,"2015":1620.4631,"2016":2699.4989,"2017":4894.4844,"2018":2756.5346,"2019":2998.3841,"2020":5739.9889,"2021":1625.6134}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":104.6864,"2002":189.2961,"2003":261.7557,"2004":1013.4078,"2005":2685.1503,"2006":3530.7869,"2007":1412.7655,"2008":1708.2864,"2009":1898.3561,"2010":1059.1684,"2011":190.2973,"2012":1254.3144,"2013":145.9132,"2014":353.2871,"2015":27.3061,"2016":44.2281,"2017":52.0737,"2018":94.9171,"2019":49.7666,"2020":36.3055,"2021":41.6125}',
    tree_cover_loss_peat_yearly:
      '{"2001":528.7445,"2002":390.5976,"2003":161.6074,"2004":1252.6295,"2005":3712.575,"2006":4343.2127,"2007":1772.0594,"2008":2303.9446,"2009":2464.0249,"2010":1167.9304,"2011":279.1415,"2012":1537.1515,"2013":224.7562,"2014":491.2814,"2015":61.843,"2016":131.9938,"2017":357.2163,"2018":236.8341,"2019":158.8393,"2020":228.2975,"2021":311.2858}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly:
      '{"2001":128.9894,"2002":338.8179,"2003":79.378,"2004":247.9782,"2005":468.4984,"2006":299.2041,"2007":197.2905,"2008":106.8366,"2009":270.2071,"2010":155.2936,"2011":134.6805,"2012":262.8229,"2013":70.3788,"2014":144.0643,"2015":27.6899,"2016":74.1473,"2017":108.7595,"2018":111.3749,"2019":113.5279,"2020":47.688,"2021":54.6875}',
    tree_cover_loss_sea_landcover_yearly:
      '{"Bare land":{"2001":199.2972,"2002":279.7517,"2003":62.6121,"2004":345.2125,"2005":1527.8291,"2006":473.4344,"2007":50.6127,"2008":124.686,"2009":117.7627,"2010":63.15,"2011":15.9991,"2012":94.9171,"2013":6.3843,"2014":10.1533,"2015":0.7692,"2016":5.9227,"2017":4.9228,"2018":4.7689,"2019":15.2299,"2020":21.2296,"2021":8.4611},"Mining":{"2001":0.4615,"2002":1.3845,"2003":0.3846,"2004":5.8457,"2005":5.9226,"2006":7.7687,"2007":6.3841,"2008":2.9998,"2009":2.5383,"2010":4.3844,"2011":2.5383,"2012":5.3073,"2013":0.0769,"2014":1.3076,"2015":0.0,"2016":0.6923,"2017":6.5381,"2018":2.9998,"2019":5.3843,"2020":2.9997,"2021":6.1534},"Rubber plantation":{"2001":135.7575,"2002":308.1285,"2003":132.2985,"2004":438.5825,"2005":476.1936,"2006":565.5752,"2007":239.3685,"2008":163.7576,"2009":344.3595,"2010":429.3575,"2011":170.7563,"2012":468.7385,"2013":61.4578,"2014":149.681,"2015":61.8426,"2016":123.6061,"2017":293.9052,"2018":191.9858,"2019":152.4481,"2020":100.8383,"2021":96.3012},"Secondary forest":{"2001":65.3043,"2002":58.2274,"2003":36.844,"2004":295.9815,"2005":851.4115,"2006":1505.5177,"2007":597.8859,"2008":895.4875,"2009":813.1086,"2010":520.4288,"2011":105.9173,"2012":654.8853,"2013":68.1489,"2014":161.7602,"2015":16.5376,"2016":27.2292,"2017":23.3062,"2018":74.6105,"2019":24.9987,"2020":20.768,"2021":16.7681},"Agriculture":{"2001":124.4516,"2002":209.0589,"2003":100.9153,"2004":250.2869,"2005":382.5866,"2006":359.3527,"2007":158.9116,"2008":56.6884,"2009":77.9941,"2010":95.1455,"2011":46.4574,"2012":90.916,"2013":18.1526,"2014":58.688,"2015":14.9988,"2016":42.1503,"2017":86.0713,"2018":67.9957,"2019":65.2256,"2020":60.3811,"2021":23.3827},"Oil palm plantation":{"2001":392.0597,"2002":304.3712,"2003":156.5297,"2004":1020.9458,"2005":1778.4546,"2006":1459.8534,"2007":712.7385,"2008":788.9593,"2009":991.5723,"2010":708.5754,"2011":291.9855,"2012":1370.2514,"2013":2362.128,"2014":3079.2619,"2015":1476.7803,"2016":2370.216,"2017":4341.4413,"2018":2239.4894,"2019":2598.0299,"2020":5345.0106,"2021":1393.3198},"Swamp":{"2001":45.7664,"2002":14.3067,"2003":2.9229,"2004":105.378,"2005":211.679,"2006":1113.5469,"2007":501.5088,"2008":585.8084,"2009":569.0409,"2010":213.5232,"2011":10.9223,"2012":230.5994,"2013":94.9171,"2014":144.9911,"2015":8.2302,"2016":11.23,"2017":9.1533,"2018":16.3066,"2019":5.1535,"2020":15.6913,"2021":11.8452},"Settlements":{"2001":1.6153,"2002":5.6919,"2003":0.3077,"2004":8.3071,"2005":5.538,"2006":2.9229,"2007":1.6922,"2008":2.8459,"2009":5.7687,"2010":18.9987,"2011":1.6152,"2012":7.8456,"2013":2.3844,"2014":7.7685,"2015":11.8451,"2016":18.6137,"2017":8.4609,"2018":6.538,"2019":16.1525,"2020":21.2293,"2021":1.9229},"Grassland/shrub":{"2001":13.9994,"2002":18.6145,"2003":20.3835,"2004":87.1506,"2005":165.7613,"2006":143.8403,"2007":79.3027,"2008":75.2269,"2009":219.4515,"2010":87.9181,"2011":41.9974,"2012":49.0741,"2013":41.5369,"2014":63.2281,"2015":4.6921,"2016":23.3061,"2017":64.6895,"2018":115.6889,"2019":59.4583,"2020":129.6117,"2021":58.3827},"Timber plantation":{"2001":44.1508,"2002":132.7607,"2003":237.7572,"2004":304.3682,"2005":460.5107,"2006":1177.3156,"2007":525.4291,"2008":207.7577,"2009":395.2854,"2010":387.8253,"2011":62.9954,"2012":202.6028,"2013":47.0733,"2014":87.6088,"2015":21.5369,"2016":59.0726,"2017":41.9203,"2018":18.8449,"2019":39.3817,"2020":19.1527,"2021":4.5382},"Water bodies":{"2001":1.6922,"2002":4.692,"2003":0.2308,"2004":9.461,"2005":1.2307,"2006":45.8435,"2007":1.5384,"2008":0.0,"2009":1.2307,"2010":1.2307,"2011":1.4615,"2012":1.9999,"2013":0.1538,"2014":5.5381,"2015":0.1538,"2016":3.2306,"2017":3.6921,"2018":0.9999,"2019":3.0767,"2020":0.3077,"2021":0.3077},"Mixed tree crops":{"2001":15.4606,"2002":3.3843,"2003":6.7689,"2004":77.9957,"2005":43.5358,"2006":34.4593,"2007":38.0745,"2008":40.6898,"2009":29.536,"2010":14.2299,"2011":8.8454,"2012":17.4603,"2013":3.9227,"2014":10.1528,"2015":3.0766,"2016":14.2293,"2017":10.3835,"2018":16.3061,"2019":13.8447,"2020":2.7689,"2021":4.2303}}',
    tree_cover_loss_idn_landcover_yearly:
      '{"Bare land":{"2001":211.5272,"2002":282.2131,"2003":63.9197,"2004":348.3662,"2005":1556.5965,"2006":884.1769,"2007":288.2888,"2008":236.909,"2009":199.4493,"2010":175.7576,"2011":20.0757,"2012":227.678,"2013":279.5304,"2014":201.5295,"2015":4.0766,"2016":7.4611,"2017":8.2303,"2018":6.3842,"2019":15.3838,"2020":22.4603,"2021":9.538},"Mining":{"2001":0.5384,"2002":3.0766,"2003":0.3846,"2004":5.9227,"2005":6.6148,"2006":7.7687,"2007":6.6148,"2008":3.0767,"2009":2.5383,"2010":8.7685,"2011":3.1536,"2012":5.6149,"2013":0.0769,"2014":1.4614,"2015":0.0769,"2016":0.6923,"2017":6.4611,"2018":2.6922,"2019":5.5381,"2020":2.9997,"2021":6.0764},"Settlement":{"2001":32.537,"2002":22.8451,"2003":28.3065,"2004":55.2284,"2005":136.5328,"2006":66.9203,"2007":60.8436,"2008":27.2294,"2009":35.9213,"2010":21.6913,"2011":8.7688,"2012":38.3059,"2013":14.7685,"2014":33.5367,"2015":13.845,"2016":20.5368,"2017":48.1515,"2018":41.1521,"2019":19.1526,"2020":45.6134,"2021":6.0767},"Secondary forest":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.1538,"2006":0.3077,"2007":0.0,"2008":0.9999,"2009":3.3842,"2010":0.0769,"2011":0.0,"2012":0.0769,"2013":0.0,"2014":5.6917,"2015":0.1538,"2016":0.0,"2017":0.2307,"2018":0.3077,"2019":0.0,"2020":0.0,"2021":0.0},"Agriculture":{"2001":169.9867,"2002":344.5885,"2003":210.4478,"2004":631.7291,"2005":802.3299,"2006":1185.5343,"2007":646.3426,"2008":340.5192,"2009":717.2678,"2010":377.5146,"2011":174.4487,"2012":488.4318,"2013":99.4552,"2014":204.7553,"2015":47.0734,"2016":120.375,"2017":289.5218,"2018":194.2212,"2019":172.9876,"2020":173.3006,"2021":89.8417},"Swamp":{"2001":101.6867,"2002":86.7642,"2003":46.9204,"2004":442.4344,"2005":1008.4784,"2006":1979.5667,"2007":865.7955,"2008":1390.6874,"2009":1356.6142,"2010":719.4938,"2011":118.7627,"2012":826.8745,"2013":97.3008,"2014":197.2199,"2015":22.2295,"2016":41.5361,"2017":40.7668,"2018":89.5327,"2019":34.4597,"2020":30.3827,"2021":27.8442},"Grassland/shrub":{"2001":0.0,"2002":0.0769,"2003":0.0,"2004":0.6923,"2005":0.0769,"2006":1.6153,"2007":0.6923,"2008":1.5384,"2009":0.0769,"2010":0.0769,"2011":0.2308,"2012":0.0,"2013":4.9998,"2014":4.7691,"2015":0.3846,"2016":0.7692,"2017":0.8461,"2018":0.0,"2019":0.2308,"2020":2.846,"2021":0.3077},"Timber plantation":{"2001":1.846,"2002":0.2308,"2003":0.0,"2004":6.7688,"2005":89.302,"2006":387.7466,"2007":114.6075,"2008":6.1534,"2009":3.6921,"2010":45.5353,"2011":0.0,"2012":0.6153,"2013":1.7691,"2014":2.9229,"2015":0.4615,"2016":24.4598,"2017":1.846,"2018":1.4614,"2019":5.1535,"2020":7.4611,"2021":0.4615},"Estate crop plantation":{"2001":521.8944,"2002":600.5771,"2003":407.976,"2004":1458.3737,"2005":2310.5682,"2006":2375.7939,"2007":930.2617,"2008":937.794,"2009":1248.7045,"2010":1195.8524,"2011":436.0508,"2012":1607.0001,"2013":2208.436,"2014":3128.2531,"2015":1532.1617,"2016":2483.6688,"2017":4498.43,"2018":2420.7833,"2019":2745.478,"2020":5454.925,"2021":1485.4672}}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly:
      '{"Sanctuary Reserves/Nature Conservation Area":{"2001":128.9894,"2002":338.8179,"2003":79.378,"2004":247.9782,"2005":468.4984,"2006":299.2041,"2007":197.2905,"2008":106.8366,"2009":270.2071,"2010":155.2936,"2011":134.6805,"2012":262.8229,"2013":70.3788,"2014":144.0643,"2015":27.6899,"2016":74.1473,"2017":108.7595,"2018":111.3749,"2019":113.5279,"2020":47.688,"2021":54.6875},"Production Forest":{"2001":366.5205,"2002":431.0547,"2003":179.4515,"2004":725.7312,"2005":1471.5446,"2006":1568.3006,"2007":991.4114,"2008":710.7381,"2009":1268.3299,"2010":553.2829,"2011":275.4489,"2012":903.5018,"2013":80.1503,"2014":293.5248,"2015":56.6125,"2016":124.8401,"2017":283.6052,"2018":104.4573,"2019":170.1469,"2020":81.1506,"2021":85.3815},"Converted Production Forest":{"2001":108.7643,"2002":88.5342,"2003":231.8348,"2004":202.0673,"2005":450.3636,"2006":988.1053,"2007":244.1427,"2008":280.1403,"2009":381.6743,"2010":523.5118,"2011":44.9972,"2012":264.2177,"2013":10.3841,"2014":52.8436,"2015":3.9998,"2016":15.1531,"2017":57.9972,"2018":27.0754,"2019":12.6917,"2020":5.615,"2021":11.4608},"Other Utilization Area":{"2001":249.9087,"2002":252.3675,"2003":199.1419,"2004":967.7932,"2005":1381.4679,"2006":923.0268,"2007":358.5968,"2008":239.9873,"2009":373.058,"2010":535.044,"2011":235.6001,"2012":1047.72,"2013":2398.4335,"2014":3037.6467,"2015":1515.6236,"2016":2448.8995,"2017":4383.3576,"2018":2424.5569,"2019":2674.0963,"2020":5541.7701,"2021":1241.3334},"Limited Production Forest":{"2001":185.8336,"2002":229.598,"2003":68.0718,"2004":805.0226,"2005":2138.779,"2006":3110.2554,"2007":1120.6978,"2008":1607.205,"2009":1273.9948,"2010":777.4045,"2011":70.7643,"2012":712.9507,"2013":146.9131,"2014":252.06,"2015":16.4603,"2016":36.3052,"2017":54.7652,"2018":88.2241,"2019":27.8445,"2020":63.7651,"2021":232.7502}}',
    tree_cover_loss_idn_forest_moratorium_yearly:
      '{"2001":538.2785,"2002":649.1896,"2003":198.6032,"2004":1275.6197,"2005":3549.5657,"2006":4310.2799,"2007":1770.7436,"2008":2143.8706,"2009":2346.4029,"2010":1146.6941,"2011":369.363,"2012":1560.1394,"2013":271.9053,"2014":517.351,"2015":54.8422,"2016":159.6049,"2017":375.5955,"2018":253.8285,"2019":211.9085,"2020":160.6056,"2021":343.3589}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 97903.8285,
    tree_cover_extent_primary_forest: 16918.7826,
    tree_cover_extent_protected_areas: 9059.3633,
    tree_cover_extent_peat: 30898.0375,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 16948.1651,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    total_area: 125580.6017,
    protected_areas_area: 16864.3763,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 35174.7371,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area:
      '{"Sanctuary Reserves/Nature Conservation Area":16864.3763,"Production Forest":21232.031,"Converted Production Forest":7242.4717,"Other Utilization Area":63109.928,"Limited Production Forest":17060.9518}',
    sea_landcover_area:
      '{"Bare land":5979.2647,"Mining":624.7946,"Rubber plantation":18924.5462,"Secondary forest":7571.6813,"Agriculture":11601.2668,"Oil palm plantation":63217.7552,"Swamp":4049.9744,"Settlements":1403.35,"Grassland/shrub":4577.0399,"Timber plantation":5551.6613,"Water bodies":245.2932,"Mixed tree crops":1833.9741}',
    idn_landcover_area:
      '{"Bare land":7654.9383,"Mining":649.023,"Settlement":4223.3258,"Secondary forest":329.8093,"Agriculture":20229.716,"Swamp":10590.5997,"Grassland/shrub":97.304,"Timber plantation":730.7239,"Estate crop plantation":81075.1617}',
    idn_forest_moratorium_area: 43109.1145,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'true',
    indonesia_presence: 'true',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 1, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 1, "2012": 1, "2013": 1, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_protected_areas_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_fires_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 1, "2020": 1}',
    commodity_threat_overall_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_overall_score:
      '{"2002": 2, "2003": 2, "2004": 2.2, "2005": 3, "2006": 3, "2007": 3, "2008": 3, "2009": 3, "2010": 3, "2011": 2.2, "2012": 2.2, "2013": 2.2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2.2, "2020": 2.2}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_protected_areas_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_overall_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_overall_score:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_forest_extent:
      '{"2002":10507.1343,"2003":10413.8318,"2004":10321.1451,"2005":10279.4552,"2006":9930.1674,"2007":8566.8633,"2008":6440.9172,"2009":5465.3594,"2010":4088.2103,"2011":2893.3558,"2012":2291.5484,"2013":2164.7863,"2014":1253.9931,"2015":1173.2293,"2016":980.9328,"2017":951.3191,"2018":914.1671,"2019":854.5549,"2020":789.5591,"2021":757.8683}',
    commodity_value_peat:
      '{"2002":35174.7371,"2003":35174.7371,"2004":35174.7371,"2005":35174.7371,"2006":35174.7371,"2007":35174.7371,"2008":35174.7371,"2009":35174.7371,"2010":35174.7371,"2011":35174.7371,"2012":35174.7371,"2013":35174.7371,"2014":35174.7371,"2015":35174.7371,"2016":35174.7371,"2017":35174.7371,"2018":35174.7371,"2019":35174.7371,"2020":35174.7371,"2021":35174.7371}',
    commodity_value_protected_areas:
      '{"2002":16864.3763,"2003":16864.3763,"2004":16864.3763,"2005":16864.3763,"2006":16864.3763,"2007":16864.3763,"2008":16864.3763,"2009":16864.3763,"2010":16864.3763,"2011":16864.3763,"2012":16864.3763,"2013":16864.3763,"2014":16864.3763,"2015":16864.3763,"2016":16864.3763,"2017":16864.3763,"2018":16864.3763,"2019":16864.3763,"2020":16864.3763,"2021":16864.3763}',
    commodity_mill_priority_level:
      '{"2017": 2, "2004": 2, "2020": 2, "2010": 2, "2012": 2, "2013": 2, "2003": 2, "2007": 2, "2019": 2, "2008": 2, "2011": 2, "2002": 2, "2018": 2, "2006": 2, "2014": 2, "2009": 2, "2015": 2, "2005": 2, "2016": 2}',
    commodity_mill_priority_score:
      '{"2017": 4, "2004": 4.2, "2020": 4.2, "2010": 5, "2012": 4.2, "2013": 4.2, "2003": 4, "2007": 5, "2019": 4.2, "2008": 5, "2011": 4.2, "2002": 4, "2018": 4, "2006": 5, "2014": 4, "2009": 5, "2015": 4, "2005": 5, "2016": 4}',
    commodity_threat_deforestation:
      '{"2002":185.9892,"2003":134.3766,"2004":390.9777,"2005":1712.592,"2006":3489.2502,"2007":3101.5038,"2008":2352.7069,"2009":2572.0036,"2010":1796.6619,"2011":728.5695,"2012":1037.5553,"2013":991.557,"2014":273.0602,"2015":221.9103,"2016":66.7657,"2017":96.7641,"2018":124.608,"2019":96.6866,"2020":56.6893,"2021":211.0604}',
    commodity_threat_peat:
      '{"2002":21429.9322,"2003":21370.0892,"2004":21617.4595,"2005":22885.7696,"2006":24544.2045,"2007":24170.7644,"2008":23545.883,"2009":23754.0267,"2010":22910.6119,"2011":21871.6718,"2012":22133.4295,"2013":22115.0448,"2014":21503.0804,"2015":21459.3915,"2016":21331.6298,"2017":21341.0136,"2018":21366.2425,"2019":21356.7052,"2020":21333.0145,"2021":21490.616}',
    commodity_threat_protected_areas:
      '{"2002":14873.8852,"2003":14870.7316,"2004":14864.6553,"2005":14865.5783,"2006":14870.5009,"2007":14871.27,"2008":14869.1933,"2009":14882.5767,"2010":14885.1149,"2011":14882.4998,"2012":14908.7283,"2013":14902.5751,"2014":14885.8074,"2015":14879.1926,"2016":14868.4242,"2017":14869.1164,"2018":14870.3472,"2019":14870.2703,"2020":14864.963,"2021":14863.5015}',
    commodity_threat_fires:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":26.0,"2020":30.0,"2021":4.0}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: null,
    landmark_category_area: null,
    landmark_by_category_area: '{}',
    draftNonOwner: false,
  },
  {
    list_id: 1172,
    'Location Name': 'id_1071',
    Latitude: 3.983333,
    Longitude: 101.133333,
    'Analysis Radius': 20,
    'Analysis Area': 125582.56409628908,
    Commodity: 'Palm Oil',
    'Location Classification': 'supply shed',
    'Company ID': 'WRI_21',
    Volume: 0,
    'Owner Name': null,
    'Owner ID': null,
    'Parent Company': 'Seri Pelangi POM',
    'Supplier Name': 'Company1',
    'Facility Name': null,
    'Refinery Name': 'refinery 8',
    'Second Supplier Name': null,
    'Second Refinery Name': null,
    'Oil Type': 'Palm oil',
    'RSPO Model': null,
    Certification: 'No',
    'Start Date': '8/1/2017',
    'End Date': '8/1/2018',
    'Time Horizon': '1 year',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Malaysia',
    State: 'Perak',
    'Sub State': 'Hilir Perak',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'MYS.9.2',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 19,
    analysis_list_id: 1172,
    template_id: 5,
    id: 19,
    location_id: 19,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":3231.8299,"2002":2849.1873,"2003":1521.8469,"2004":1585.4919,"2005":2162.693,"2006":1173.5647,"2007":3195.3983,"2008":1583.0649,"2009":4862.1782,"2010":3638.3611,"2011":1601.5309,"2012":2625.0445,"2013":2147.2443,"2014":4219.934,"2015":1640.0748,"2016":3030.4006,"2017":3090.644,"2018":3208.8069,"2019":2043.8492,"2020":2283.719,"2021":2863.6885}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":0.2302,"2002":115.5954,"2003":654.5132,"2004":77.2937,"2005":0.307,"2006":0.3838,"2007":37.8399,"2008":3.0701,"2009":57.1029,"2010":81.4333,"2011":6.2935,"2012":74.6017,"2013":22.7948,"2014":89.5698,"2015":1.3048,"2016":1.6886,"2017":0.614,"2018":17.3445,"2019":11.2048,"2020":1.4582,"2021":5.5262}',
    tree_cover_loss_peat_yearly:
      '{"2001":1310.3538,"2002":1585.3139,"2003":1203.4085,"2004":848.242,"2005":1217.4437,"2006":774.5524,"2007":1997.6963,"2008":838.8031,"2009":1973.4578,"2010":1971.7843,"2011":858.0097,"2012":1523.6179,"2013":1239.5811,"2014":2766.6693,"2015":1039.8908,"2016":2297.5245,"2017":1925.9447,"2018":2107.8727,"2019":1159.6854,"2020":1519.1336,"2021":2013.9897}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly:
      '{"Bare land":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.7674,"2009":25.7081,"2010":13.4297,"2011":0.7674,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0},"Rubber plantation":{"2001":7.5991,"2002":12.0509,"2003":219.3748,"2004":54.8056,"2005":4.0683,"2006":19.1134,"2007":242.2511,"2008":230.8915,"2009":330.8302,"2010":246.7062,"2011":158.1262,"2012":133.0254,"2013":32.5467,"2014":6.5246,"2015":10.5931,"2016":99.4048,"2017":81.6737,"2018":29.9363,"2019":9.3646,"2020":8.5972,"2021":154.7444},"Secondary forest":{"2001":13.8154,"2002":2.9164,"2003":34.1566,"2004":3.6072,"2005":14.1227,"2006":60.7142,"2007":220.6732,"2008":6.1405,"2009":32.1581,"2010":33.3824,"2011":34.5386,"2012":109.522,"2013":323.431,"2014":407.0276,"2015":40.3732,"2016":15.0418,"2017":7.7509,"2018":31.4659,"2019":19.8778,"2020":7.137,"2021":12.6631},"Agriculture":{"2001":11.6651,"2002":31.6194,"2003":1.6116,"2004":8.2884,"2005":31.1589,"2006":19.3401,"2007":20.7215,"2008":29.3937,"2009":64.9273,"2010":32.6167,"2011":10.6676,"2012":37.8359,"2013":4.6048,"2014":13.8141,"2015":7.4444,"2016":31.9258,"2017":29.1632,"2018":13.5067,"2019":12.2022,"2020":15.4258,"2021":25.3259},"Oil palm plantation":{"2001":3190.8454,"2002":2799.5308,"2003":1261.2547,"2004":1517.7164,"2005":2109.9663,"2006":1068.7945,"2007":2703.8477,"2008":1312.8019,"2009":4393.3587,"2010":3276.9991,"2011":1388.6054,"2012":2330.4634,"2013":1776.9154,"2014":3776.7582,"2015":1577.9803,"2016":2867.3745,"2017":2963.6142,"2018":3125.4559,"2019":1996.4183,"2020":2239.5125,"2021":2649.5431},"Settlements":{"2001":4.0676,"2002":0.3837,"2003":5.2957,"2004":0.307,"2005":1.9187,"2006":4.4514,"2007":3.5304,"2008":3.0699,"2009":9.5167,"2010":27.7063,"2011":5.7558,"2012":0.921,"2013":0.6907,"2014":0.8442,"2015":1.0745,"2016":6.2166,"2017":3.5304,"2018":1.9187,"2019":2.2257,"2020":1.8418,"2021":0.6907},"Grassland/shrub":{"2001":2.8396,"2002":2.3791,"2003":0.1535,"2004":0.2302,"2005":1.2279,"2006":1.0744,"2007":4.3744,"2008":0.0,"2009":4.4513,"2010":5.6024,"2011":2.993,"2012":12.0489,"2013":7.5977,"2014":14.4281,"2015":2.4558,"2016":7.1374,"2017":3.6838,"2018":5.6792,"2019":2.6862,"2020":9.4396,"2021":20.0305},"Water bodies":{"2001":0.2302,"2002":0.1535,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0767,"2013":0.1535,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.307,"2020":0.0,"2021":0.2302},"Mixed tree crops":{"2001":0.7674,"2002":0.1535,"2003":0.0,"2004":0.5372,"2005":0.2302,"2006":0.0767,"2007":0.0,"2008":0.0,"2009":1.2278,"2010":1.9184,"2011":0.0767,"2012":1.1511,"2013":1.3045,"2014":0.5372,"2015":0.1535,"2016":3.2997,"2017":1.2278,"2018":0.8441,"2019":0.7674,"2020":1.765,"2021":0.4604}}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 89073.9323,
    tree_cover_extent_primary_forest: 1722.837,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 50468.1378,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 1738.4188,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    total_area: 125584.5779,
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 67653.6854,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area:
      '{"Bare land":89.9401,"Rubber plantation":2665.3913,"Secondary forest":2830.8794,"Agriculture":15978.8057,"Oil palm plantation":99383.0816,"Settlements":1984.6124,"Grassland/shrub":791.1669,"Water bodies":1513.9974,"Mixed tree crops":346.703}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'true',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 1}',
    commodity_threat_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_threat_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1.2}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent:
      '{"2002":734.8664,"2003":732.6409,"2004":724.4291,"2005":724.0454,"2006":723.8919,"2007":721.129,"2008":716.1404,"2009":709.1568,"2010":708.1591,"2011":693.5009,"2012":681.0681,"2013":679.8402,"2014":662.4965,"2015":660.0407,"2016":648.0691,"2017":647.4551,"2018":645.9202,"2019":643.3109,"2020":637.5554,"2021":636.3276}',
    commodity_value_peat:
      '{"2002":67653.6854,"2003":67653.6854,"2004":67653.6854,"2005":67653.6854,"2006":67653.6854,"2007":67653.6854,"2008":67653.6854,"2009":67653.6854,"2010":67653.6854,"2011":67653.6854,"2012":67653.6854,"2013":67653.6854,"2014":67653.6854,"2015":67653.6854,"2016":67653.6854,"2017":67653.6854,"2018":67653.6854,"2019":67653.6854,"2020":67653.6854,"2021":67653.6854}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2017": 1, "2004": 1, "2020": 1, "2010": 1, "2012": 1, "2013": 1, "2003": 1, "2007": 1, "2019": 1, "2008": 1, "2011": 1, "2002": 1, "2018": 1, "2006": 1, "2014": 1, "2009": 1, "2015": 1, "2005": 1, "2016": 1}',
    commodity_mill_priority_score:
      '{"2017": 2, "2004": 2, "2020": 2.2, "2010": 2, "2012": 2, "2013": 2, "2003": 2, "2007": 2, "2019": 2, "2008": 2, "2011": 2, "2002": 2, "2018": 2, "2006": 2, "2014": 2, "2009": 2, "2015": 2, "2005": 2, "2016": 2}',
    commodity_threat_deforestation:
      '{"2002":10.4373,"2003":8.5956,"2004":0.5372,"2005":2.9164,"2006":7.7515,"2007":11.9722,"2008":7.9813,"2009":15.6559,"2010":27.091,"2011":13.6607,"2012":18.5716,"2013":19.7995,"2014":14.4274,"2015":12.5856,"2016":2.1489,"2017":4.1442,"2018":8.3649,"2019":6.9834,"2020":2.9929,"2021":4.1443}',
    commodity_threat_peat:
      '{"2002":60788.9597,"2003":60789.1132,"2004":60787.7319,"2005":60787.8086,"2006":60788.1156,"2007":60788.0389,"2008":60788.3459,"2009":60790.3412,"2010":60791.3389,"2011":60789.2668,"2012":60788.1924,"2013":60788.2691,"2014":60789.4202,"2015":60789.4202,"2016":60788.5761,"2017":60789.2667,"2018":60791.7224,"2019":60791.262,"2020":60788.0389,"2021":60787.8854}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":15.5,"2020":24.0,"2021":8.5}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: null,
    landmark_category_area: null,
    landmark_by_category_area: '{}',
    draftNonOwner: false,
  },
  {
    list_id: 1172,
    'Location Name': 'id_1072',
    Latitude: 3.75,
    Longitude: 101.116667,
    'Analysis Radius': 20,
    'Analysis Area': 121924.21679658204,
    Commodity: 'Palm Oil',
    'Location Classification': 'supply shed',
    'Company ID': 'WRI_22',
    Volume: 0,
    'Owner Name': null,
    'Owner ID': null,
    'Parent Company': 'Ulu bernam POM',
    'Supplier Name': 'Company1',
    'Facility Name': null,
    'Refinery Name': 'refinery 9',
    'Second Supplier Name': null,
    'Second Refinery Name': null,
    'Oil Type': 'Palm oil',
    'RSPO Model': null,
    Certification: 'No',
    'Start Date': '8/1/2017',
    'End Date': '8/1/2018',
    'Time Horizon': '1 year',
    'Accuracy Rating of Location Entered': 0,
    Country: 'Malaysia',
    State: 'Perak',
    'Sub State': 'Hilir Perak',
    'Wind Barrier': '',
    'Riparian Buffers': '',
    'Buffer Zones': '',
    gadmid: 'MYS.9.2',
    flag_general: 0,
    flag_gran_chaco: 0,
    flag_glad: 0,
    flag_forma: 0,
    flag_viirs: 0,
    flag_terrai: 0,
    list_location_id: 23,
    analysis_list_id: 1172,
    template_id: 5,
    id: 23,
    location_id: 23,
    location_status_id: 2,
    tree_cover_loss_total_yearly:
      '{"2001":2577.2505,"2002":2010.6615,"2003":1480.8366,"2004":1849.0767,"2005":2100.9732,"2006":970.9614,"2007":2632.1816,"2008":2022.5167,"2009":4084.5146,"2010":3030.7623,"2011":1237.9183,"2012":2180.9378,"2013":2089.9597,"2014":4279.6906,"2015":2040.4339,"2016":3914.3785,"2017":3851.6214,"2018":1849.318,"2019":1436.6595,"2020":1289.8155,"2021":2137.8047}',
    tree_cover_loss_primary_forest_yearly:
      '{"2001":27.8695,"2002":123.7365,"2003":727.9121,"2004":79.6792,"2005":281.0712,"2006":45.5276,"2007":140.1075,"2008":21.42,"2009":96.5002,"2010":71.3956,"2011":16.43,"2012":23.2639,"2013":5.8349,"2014":57.3517,"2015":11.2094,"2016":0.3839,"2017":1.0749,"2018":0.6142,"2019":1.9962,"2020":5.2211,"2021":61.9581}',
    tree_cover_loss_peat_yearly:
      '{"2001":1712.6753,"2002":1179.4125,"2003":1277.0861,"2004":1211.0219,"2005":1522.7321,"2006":845.9772,"2007":2166.0313,"2008":1189.1791,"2009":1831.8619,"2010":1972.5752,"2011":928.0802,"2012":1583.0663,"2013":1410.1067,"2014":3378.9873,"2015":1510.8915,"2016":2633.9623,"2017":2582.8772,"2018":1309.6164,"2019":626.1077,"2020":1090.3671,"2021":1848.4664}',
    tree_cover_loss_intact_forest_yearly: '{}',
    tree_cover_loss_protected_areas_yearly: '{}',
    tree_cover_loss_sea_landcover_yearly:
      '{"Coastal fish pond":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.3071,"2005":0.0768,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.4607,"2010":0.4607,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.3839,"2018":0.1536,"2019":0.2303,"2020":0.0768,"2021":0.0},"Rubber plantation":{"2001":246.6675,"2002":111.7762,"2003":253.1538,"2004":186.6244,"2005":126.7489,"2006":102.7187,"2007":389.2705,"2008":618.3656,"2009":1706.409,"2010":827.3146,"2011":205.1108,"2012":322.6554,"2013":100.9517,"2014":182.1729,"2015":109.5475,"2016":293.6338,"2017":185.9272,"2018":82.449,"2019":105.7899,"2020":53.4321,"2021":193.7445},"Secondary forest":{"2001":14.2039,"2002":23.9545,"2003":0.8445,"2004":0.3071,"2005":72.5554,"2006":6.91,"2007":0.4607,"2008":3.2247,"2009":4.6066,"2010":4.2228,"2011":0.6142,"2012":29.4839,"2013":2.2265,"2014":9.674,"2015":11.2861,"2016":0.0,"2017":0.3839,"2018":0.4606,"2019":0.5375,"2020":4.4533,"2021":67.9475},"Agriculture":{"2001":19.2708,"2002":3.2249,"2003":0.0768,"2004":3.455,"2005":2.9943,"2006":7.1404,"2007":0.8446,"2008":0.7677,"2009":1.5356,"2010":0.7678,"2011":0.4607,"2012":0.691,"2013":0.9214,"2014":0.6142,"2015":0.0,"2016":0.1536,"2017":0.3839,"2018":0.3071,"2019":0.0768,"2020":0.0,"2021":0.3071},"Oil palm plantation":{"2001":2256.7985,"2002":1862.1852,"2003":1222.6153,"2004":1633.1992,"2005":1852.4523,"2006":818.3354,"2007":2212.3516,"2008":1390.5612,"2009":2341.4046,"2010":2162.984,"2011":1021.751,"2012":1801.3873,"2013":1982.2514,"2014":4072.6405,"2015":1915.3772,"2016":3610.8399,"2017":3658.4001,"2018":1751.2821,"2019":1317.7398,"2020":1222.3323,"2021":1853.9225},"Settlements":{"2001":40.3098,"2002":9.5207,"2003":4.1462,"2004":25.1839,"2005":46.1455,"2006":35.8569,"2007":29.2542,"2008":9.5976,"2009":30.0981,"2010":34.8589,"2011":9.9816,"2012":26.7202,"2013":3.6088,"2014":14.589,"2015":4.2231,"2016":9.6745,"2017":6.1425,"2018":14.5888,"2019":11.8245,"2020":9.5211,"2021":21.883},"Water bodies":{"2001":0.0,"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.1535,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0768,"2017":0.0,"2018":0.0768,"2019":0.4606,"2020":0.0,"2021":0.0}}',
    tree_cover_loss_idn_landcover_yearly: '{}',
    tree_cover_loss_idn_primary_forest_yearly: '{}',
    tree_cover_loss_soy_yearly: '{}',
    tree_cover_loss_idn_legal_yearly: '{}',
    tree_cover_loss_idn_forest_moratorium_yearly: '{}',
    tree_cover_loss_prodes_yearly: '{}',
    tree_cover_loss_prodes_wdpa_yearly: '{}',
    tree_cover_loss_prodes_primary_forest_yearly: '{}',
    tree_cover_loss_brazil_biomes_yearly: '{}',
    tree_cover_extent_total: 93644.6529,
    tree_cover_extent_primary_forest: 22680.4125,
    tree_cover_extent_protected_areas: 0,
    tree_cover_extent_peat: 72817.5516,
    tree_cover_extent_intact_forest: 0,
    natural_habitat_primary: 22698.2975,
    natural_habitat_intact_forest: 0,
    natural_habitat_global_land_cover: '{}',
    total_area: 121922.883,
    protected_areas_area: 0,
    critical_habitat_alliance_zero: 0,
    indigenous_people_land_rights: 0,
    peat_area: 87807.8912,
    fires_counts_monthly: '',
    soy_total_area: '{}',
    soy_pre2001_nonforest_area: 0,
    brazil_biomes: '{}',
    idn_legal_area: '{}',
    sea_landcover_area:
      '{"Coastal fish pond":139.9744,"Rubber plantation":12664.9425,"Secondary forest":22152.2634,"Agriculture":10946.9531,"Oil palm plantation":73011.4466,"Settlements":2817.8305,"Water bodies":112.9979}',
    idn_landcover_area: '{}',
    idn_forest_moratorium_area: 0,
    south_america_presence: 'false',
    legal_amazon_presence: 'false',
    brazil_biomes_presence: 'false',
    cerrado_biome_presence: 'false',
    southeast_asia_presence: 'true',
    indonesia_presence: 'false',
    commodity_threat_deforestation_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_threat_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_fires_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_threat_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_threat_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_peat_level:
      '{"2002": 2, "2003": 2, "2004": 2, "2005": 2, "2006": 2, "2007": 2, "2008": 2, "2009": 2, "2010": 2, "2011": 2, "2012": 2, "2013": 2, "2014": 2, "2015": 2, "2016": 2, "2017": 2, "2018": 2, "2019": 2, "2020": 2}',
    commodity_value_protected_areas_level:
      '{"2002": 0, "2003": 0, "2004": 0, "2005": 0, "2006": 0, "2007": 0, "2008": 0, "2009": 0, "2010": 0, "2011": 0, "2012": 0, "2013": 0, "2014": 0, "2015": 0, "2016": 0, "2017": 0, "2018": 0, "2019": 0, "2020": 0}',
    commodity_value_overall_level:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_overall_score:
      '{"2002": 1, "2003": 1, "2004": 1, "2005": 1, "2006": 1, "2007": 1, "2008": 1, "2009": 1, "2010": 1, "2011": 1, "2012": 1, "2013": 1, "2014": 1, "2015": 1, "2016": 1, "2017": 1, "2018": 1, "2019": 1, "2020": 1}',
    commodity_value_forest_extent:
      '{"2002":19970.416,"2003":19960.8186,"2004":19949.4557,"2005":19949.0718,"2006":19947.6897,"2007":19892.4862,"2008":19885.1155,"2009":19884.8084,"2010":19882.6586,"2011":19880.8927,"2012":19877.2841,"2013":19875.8253,"2014":19868.5311,"2015":19867.6098,"2016":19863.6172,"2017":19855.8628,"2018":19855.8628,"2019":19855.786,"2020":19855.786,"2021":19855.2485}',
    commodity_value_peat:
      '{"2002":87807.8912,"2003":87807.8912,"2004":87807.8912,"2005":87807.8912,"2006":87807.8912,"2007":87807.8912,"2008":87807.8912,"2009":87807.8912,"2010":87807.8912,"2011":87807.8912,"2012":87807.8912,"2013":87807.8912,"2014":87807.8912,"2015":87807.8912,"2016":87807.8912,"2017":87807.8912,"2018":87807.8912,"2019":87807.8912,"2020":87807.8912,"2021":87807.8912}',
    commodity_value_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_mill_priority_level:
      '{"2017": 1, "2004": 1, "2020": 1, "2010": 1, "2012": 1, "2013": 1, "2003": 1, "2007": 1, "2019": 1, "2008": 1, "2011": 1, "2002": 1, "2018": 1, "2006": 1, "2014": 1, "2009": 1, "2015": 1, "2005": 1, "2016": 1}',
    commodity_mill_priority_score:
      '{"2017": 2, "2004": 2, "2020": 2, "2010": 2, "2012": 2, "2013": 2, "2003": 2, "2007": 2, "2019": 2, "2008": 2, "2011": 2, "2002": 2, "2018": 2, "2006": 2, "2014": 2, "2009": 2, "2015": 2, "2005": 2, "2016": 2}',
    commodity_threat_deforestation:
      '{"2002":20.9604,"2003":11.7468,"2004":1.7659,"2005":56.5856,"2006":62.5742,"2007":7.6778,"2008":2.4569,"2009":3.9157,"2010":5.3745,"2011":5.0674,"2012":8.753,"2013":8.2155,"2014":4.9139,"2015":11.747,"2016":7.7544,"2017":0.0768,"2018":0.0768,"2019":0.5375,"2020":4.6836,"2021":59.7325}',
    commodity_threat_peat:
      '{"2002":62789.4724,"2003":62782.1783,"2004":62773.5793,"2005":62827.7847,"2006":62833.3895,"2007":62779.1073,"2008":62774.731,"2009":62775.4219,"2010":62776.113,"2011":62776.3433,"2012":62780.6431,"2013":62780.336,"2014":62777.4951,"2015":62784.3282,"2016":62780.3356,"2017":62772.5812,"2018":62772.5812,"2019":62773.1186,"2020":62777.2648,"2021":62832.3137}',
    commodity_threat_protected_areas:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":0.0,"2020":0.0,"2021":0.0}',
    commodity_threat_fires:
      '{"2002":0.0,"2003":0.0,"2004":0.0,"2005":0.0,"2006":0.0,"2007":0.0,"2008":0.0,"2009":0.0,"2010":0.0,"2011":0.0,"2012":0.0,"2013":0.0,"2014":0.0,"2015":0.0,"2016":0.0,"2017":0.0,"2018":0.0,"2019":8.5,"2020":13.0,"2021":4.5}',
    dissolved_data_location_info: '{}',
    tree_cover_loss_arg_otbn_yearly: '{}',
    arg_otbn_area: '{}',
    argentina_presence: 'false',
    protected_areas_by_category_area: null,
    landmark_category_area: null,
    landmark_by_category_area: '{}',
    draftNonOwner: false,
  },
];

export const alertsData = [
  {
    list_id: 5479,
    location_id: 32,
    gadm_id: 'BRA.12.116',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-02',
        count: 638,
      },
      {
        day: '2021-01-26',
        count: 370,
      },
      {
        day: '2021-02-04',
        count: 5,
      },
      {
        day: '2021-03-15',
        count: 2,
      },
      {
        day: '2021-03-31',
        count: 62,
      },
      {
        day: '2021-04-01',
        count: 2,
      },
      {
        day: '2021-04-09',
        count: 1,
      },
      {
        day: '2021-04-16',
        count: 366,
      },
      {
        day: '2021-05-02',
        count: 26,
      },
      {
        day: '2021-05-03',
        count: 339,
      },
      {
        day: '2021-05-11',
        count: 234,
      },
      {
        day: '2021-05-19',
        count: 586,
      },
      {
        day: '2021-05-26',
        count: 13,
      },
      {
        day: '2021-05-27',
        count: 142,
      },
      {
        day: '2021-06-03',
        count: 229,
      },
      {
        day: '2021-06-04',
        count: 34,
      },
      {
        day: '2021-06-11',
        count: 2,
      },
      {
        day: '2021-06-12',
        count: 17,
      },
      {
        day: '2021-06-19',
        count: 26,
      },
      {
        day: '2021-06-20',
        count: 17,
      },
      {
        day: '2021-06-27',
        count: 20,
      },
      {
        day: '2021-06-28',
        count: 7,
      },
      {
        day: '2021-07-05',
        count: 65,
      },
      {
        day: '2021-07-06',
        count: 22,
      },
      {
        day: '2021-07-13',
        count: 40,
      },
      {
        day: '2021-07-14',
        count: 13,
      },
      {
        day: '2021-07-21',
        count: 17,
      },
      {
        day: '2021-07-22',
        count: 15,
      },
      {
        day: '2021-07-29',
        count: 36,
      },
      {
        day: '2021-07-30',
        count: 12,
      },
      {
        day: '2021-08-06',
        count: 7,
      },
      {
        day: '2021-08-07',
        count: 32,
      },
      {
        day: '2021-08-14',
        count: 41,
      },
      {
        day: '2021-08-15',
        count: 13,
      },
      {
        day: '2021-08-22',
        count: 22,
      },
      {
        day: '2021-08-23',
        count: 232,
      },
      {
        day: '2021-08-30',
        count: 49,
      },
      {
        day: '2021-08-31',
        count: 16,
      },
      {
        day: '2021-09-07',
        count: 5,
      },
      {
        day: '2021-09-08',
        count: 4,
      },
      {
        day: '2021-09-15',
        count: 16,
      },
      {
        day: '2021-09-16',
        count: 47,
      },
      {
        day: '2021-09-23',
        count: 1,
      },
      {
        day: '2021-10-01',
        count: 595,
      },
      {
        day: '2021-10-02',
        count: 78,
      },
      {
        day: '2021-10-10',
        count: 72,
      },
      {
        day: '2021-10-17',
        count: 181,
      },
      {
        day: '2021-10-26',
        count: 4,
      },
      {
        day: '2021-11-18',
        count: 3,
      },
      {
        day: '2021-11-27',
        count: 148,
      },
      {
        day: '2022-01-06',
        count: 2,
      },
      {
        day: '2022-01-14',
        count: 49,
      },
      {
        day: '2022-01-21',
        count: 34,
      },
      {
        day: '2022-01-22',
        count: 5,
      },
      {
        day: '2022-02-22',
        count: 11,
      },
      {
        day: '2022-03-18',
        count: 80,
      },
      {
        day: '2022-03-19',
        count: 665,
      },
      {
        day: '2022-03-26',
        count: 23,
      },
      {
        day: '2022-03-27',
        count: 8,
      },
      {
        day: '2022-04-03',
        count: 346,
      },
      {
        day: '2022-04-04',
        count: 157,
      },
      {
        day: '2022-04-11',
        count: 203,
      },
      {
        day: '2022-04-20',
        count: 20,
      },
      {
        day: '2022-04-27',
        count: 294,
      },
      {
        day: '2022-05-06',
        count: 186,
      },
      {
        day: '2022-05-22',
        count: 572,
      },
      {
        day: '2022-05-29',
        count: 4,
      },
      {
        day: '2022-06-07',
        count: 176,
      },
      {
        day: '2022-06-14',
        count: 7,
      },
      {
        day: '2022-06-23',
        count: 53,
      },
      {
        day: '2022-06-30',
        count: 1,
      },
      {
        day: '2022-07-09',
        count: 38,
      },
      {
        day: '2022-07-25',
        count: 97,
      },
      {
        day: '2022-08-01',
        count: 9,
      },
      {
        day: '2022-08-10',
        count: 2,
      },
      {
        day: '2022-08-11',
        count: 52,
      },
      {
        day: '2022-08-17',
        count: 8,
      },
      {
        day: '2022-08-26',
        count: 11,
      },
      {
        day: '2022-08-28',
        count: 15,
      },
      {
        day: '2022-09-11',
        count: 1,
      },
      {
        day: '2022-09-14',
        count: 7,
      },
      {
        day: '2022-09-27',
        count: 62,
      },
      {
        day: '2022-10-01',
        count: 285,
      },
      {
        day: '2022-10-04',
        count: 51,
      },
      {
        day: '2022-11-04',
        count: 340,
      },
      {
        day: '2022-11-05',
        count: 601,
      },
      {
        day: '2022-11-09',
        count: 3,
      },
      {
        day: '2022-11-21',
        count: 15,
      },
      {
        day: '2022-11-30',
        count: 4,
      },
      {
        day: '2022-12-07',
        count: 131,
      },
      {
        day: '2022-12-13',
        count: 58,
      },
      {
        day: '2023-01-01',
        count: 231,
      },
      {
        day: '2023-01-16',
        count: 13,
      },
      {
        day: '2023-02-02',
        count: 687,
      },
      {
        day: '2023-02-07',
        count: 32,
      },
      {
        day: '2023-02-09',
        count: 30,
      },
      {
        day: '2023-03-06',
        count: 76,
      },
      {
        day: '2023-03-29',
        count: 4,
      },
      {
        day: '2023-03-30',
        count: 791,
      },
      {
        day: '2023-04-14',
        count: 66,
      },
      {
        day: '2023-04-15',
        count: 217,
      },
      {
        day: '2023-04-30',
        count: 1786,
      },
      {
        day: '2023-05-01',
        count: 1840,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2020-53',
        count: 638,
      },
      {
        day: '2021-04',
        count: 370,
      },
      {
        day: '2021-05',
        count: 5,
      },
      {
        day: '2021-11',
        count: 2,
      },
      {
        day: '2021-13',
        count: 64,
      },
      {
        day: '2021-14',
        count: 1,
      },
      {
        day: '2021-15',
        count: 366,
      },
      {
        day: '2021-17',
        count: 26,
      },
      {
        day: '2021-18',
        count: 339,
      },
      {
        day: '2021-19',
        count: 234,
      },
      {
        day: '2021-20',
        count: 586,
      },
      {
        day: '2021-21',
        count: 155,
      },
      {
        day: '2021-22',
        count: 263,
      },
      {
        day: '2021-23',
        count: 19,
      },
      {
        day: '2021-24',
        count: 43,
      },
      {
        day: '2021-25',
        count: 20,
      },
      {
        day: '2021-26',
        count: 7,
      },
      {
        day: '2021-27',
        count: 87,
      },
      {
        day: '2021-28',
        count: 53,
      },
      {
        day: '2021-29',
        count: 32,
      },
      {
        day: '2021-30',
        count: 48,
      },
      {
        day: '2021-31',
        count: 39,
      },
      {
        day: '2021-32',
        count: 54,
      },
      {
        day: '2021-33',
        count: 22,
      },
      {
        day: '2021-34',
        count: 232,
      },
      {
        day: '2021-35',
        count: 65,
      },
      {
        day: '2021-36',
        count: 9,
      },
      {
        day: '2021-37',
        count: 63,
      },
      {
        day: '2021-38',
        count: 1,
      },
      {
        day: '2021-39',
        count: 673,
      },
      {
        day: '2021-40',
        count: 72,
      },
      {
        day: '2021-41',
        count: 181,
      },
      {
        day: '2021-43',
        count: 4,
      },
      {
        day: '2021-46',
        count: 3,
      },
      {
        day: '2021-47',
        count: 148,
      },
      {
        day: '2022-01',
        count: 2,
      },
      {
        day: '2022-02',
        count: 49,
      },
      {
        day: '2022-03',
        count: 39,
      },
      {
        day: '2022-08',
        count: 11,
      },
      {
        day: '2022-11',
        count: 745,
      },
      {
        day: '2022-12',
        count: 31,
      },
      {
        day: '2022-13',
        count: 346,
      },
      {
        day: '2022-14',
        count: 157,
      },
      {
        day: '2022-15',
        count: 203,
      },
      {
        day: '2022-16',
        count: 20,
      },
      {
        day: '2022-17',
        count: 294,
      },
      {
        day: '2022-18',
        count: 186,
      },
      {
        day: '2022-20',
        count: 572,
      },
      {
        day: '2022-21',
        count: 4,
      },
      {
        day: '2022-23',
        count: 176,
      },
      {
        day: '2022-24',
        count: 7,
      },
      {
        day: '2022-25',
        count: 53,
      },
      {
        day: '2022-26',
        count: 1,
      },
      {
        day: '2022-27',
        count: 38,
      },
      {
        day: '2022-30',
        count: 97,
      },
      {
        day: '2022-31',
        count: 9,
      },
      {
        day: '2022-32',
        count: 54,
      },
      {
        day: '2022-33',
        count: 8,
      },
      {
        day: '2022-34',
        count: 26,
      },
      {
        day: '2022-36',
        count: 1,
      },
      {
        day: '2022-37',
        count: 7,
      },
      {
        day: '2022-39',
        count: 347,
      },
      {
        day: '2022-40',
        count: 51,
      },
      {
        day: '2022-44',
        count: 941,
      },
      {
        day: '2022-45',
        count: 3,
      },
      {
        day: '2022-47',
        count: 15,
      },
      {
        day: '2022-48',
        count: 4,
      },
      {
        day: '2022-49',
        count: 131,
      },
      {
        day: '2022-50',
        count: 58,
      },
      {
        day: '2022-52',
        count: 231,
      },
      {
        day: '2023-03',
        count: 13,
      },
      {
        day: '2023-05',
        count: 687,
      },
      {
        day: '2023-06',
        count: 62,
      },
      {
        day: '2023-10',
        count: 76,
      },
      {
        day: '2023-13',
        count: 795,
      },
      {
        day: '2023-15',
        count: 283,
      },
      {
        day: '2023-17',
        count: 1786,
      },
      {
        day: '2023-18',
        count: 1840,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1008,
      },
      {
        day: '2021-02',
        count: 5,
      },
      {
        day: '2021-03',
        count: 64,
      },
      {
        day: '2021-04',
        count: 369,
      },
      {
        day: '2021-05',
        count: 1340,
      },
      {
        day: '2021-06',
        count: 352,
      },
      {
        day: '2021-07',
        count: 220,
      },
      {
        day: '2021-08',
        count: 412,
      },
      {
        day: '2021-09',
        count: 73,
      },
      {
        day: '2021-10',
        count: 930,
      },
      {
        day: '2021-11',
        count: 151,
      },
      {
        day: '2022-01',
        count: 90,
      },
      {
        day: '2022-02',
        count: 11,
      },
      {
        day: '2022-03',
        count: 776,
      },
      {
        day: '2022-04',
        count: 1020,
      },
      {
        day: '2022-05',
        count: 762,
      },
      {
        day: '2022-06',
        count: 237,
      },
      {
        day: '2022-07',
        count: 135,
      },
      {
        day: '2022-08',
        count: 97,
      },
      {
        day: '2022-09',
        count: 70,
      },
      {
        day: '2022-10',
        count: 336,
      },
      {
        day: '2022-11',
        count: 963,
      },
      {
        day: '2022-12',
        count: 189,
      },
      {
        day: '2023-01',
        count: 244,
      },
      {
        day: '2023-02',
        count: 749,
      },
      {
        day: '2023-03',
        count: 871,
      },
      {
        day: '2023-04',
        count: 2069,
      },
      {
        day: '2023-05',
        count: 1840,
      },
    ],
    viirs_alerts_daily: [
      {
        day: '2023-04-29',
        count: 1,
      },
      {
        day: '2023-04-30',
        count: 1,
      },
    ],
    tree_cover_extent_total: 181657.3195,
    Country: 'Brazil',
    State: 'Mato Grosso',
    'Sub State': 'Sinop',
    name_all: 'Brazil--Mato Grosso--Sinop',
    gadmid: 'BRA.12.116',
    gadmid_2: 'BRA.12.116',
    gadmid_2_lat: -11.77378101458866,
    gadmid_2_lon: -55.455702556922915,
    gadmid_1: 'BRA.12',
    gadmid_1_lat: -12.9495997422582,
    gadmid_1_lon: -55.919201371905686,
    gadmid_0: 'BRA',
    gadmid_0_lat: -10.743642753226414,
    gadmid_0_lon: -53.07657618709698,
    location_lat: -11.77378101,
    location_lon: -55.45570256,
    location_name: 'BRA.12.116_1',
    fire: [
      {
        day: '2023-04-29',
        count: 1,
      },
      {
        day: '2023-04-30',
        count: 1,
      },
    ],
    fireAlerts: true,
    umd: 181657.3195,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
  {
    list_id: 5479,
    location_id: 31,
    gadm_id: 'ARG.3.17',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-02',
        count: 1,
      },
      {
        day: '2021-08-30',
        count: 1,
      },
      {
        day: '2021-09-15',
        count: 18,
      },
      {
        day: '2021-10-25',
        count: 16,
      },
      {
        day: '2021-11-02',
        count: 13,
      },
      {
        day: '2021-11-18',
        count: 28,
      },
      {
        day: '2021-11-26',
        count: 4,
      },
      {
        day: '2022-02-06',
        count: 6,
      },
      {
        day: '2022-10-04',
        count: 6,
      },
      {
        day: '2022-10-23',
        count: 2,
      },
      {
        day: '2022-11-05',
        count: 24,
      },
      {
        day: '2022-12-07',
        count: 7,
      },
      {
        day: '2023-01-16',
        count: 3,
      },
      {
        day: '2023-01-21',
        count: 1,
      },
      {
        day: '2023-01-24',
        count: 7,
      },
      {
        day: '2023-02-09',
        count: 6,
      },
      {
        day: '2023-02-24',
        count: 3,
      },
      {
        day: '2023-02-25',
        count: 15,
      },
      {
        day: '2023-03-13',
        count: 2,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2020-53',
        count: 1,
      },
      {
        day: '2021-35',
        count: 1,
      },
      {
        day: '2021-37',
        count: 18,
      },
      {
        day: '2021-43',
        count: 16,
      },
      {
        day: '2021-44',
        count: 13,
      },
      {
        day: '2021-46',
        count: 28,
      },
      {
        day: '2021-47',
        count: 4,
      },
      {
        day: '2022-05',
        count: 6,
      },
      {
        day: '2022-40',
        count: 6,
      },
      {
        day: '2022-42',
        count: 2,
      },
      {
        day: '2022-44',
        count: 24,
      },
      {
        day: '2022-49',
        count: 7,
      },
      {
        day: '2023-03',
        count: 4,
      },
      {
        day: '2023-04',
        count: 7,
      },
      {
        day: '2023-06',
        count: 6,
      },
      {
        day: '2023-08',
        count: 18,
      },
      {
        day: '2023-11',
        count: 2,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1,
      },
      {
        day: '2021-08',
        count: 1,
      },
      {
        day: '2021-09',
        count: 18,
      },
      {
        day: '2021-10',
        count: 16,
      },
      {
        day: '2021-11',
        count: 45,
      },
      {
        day: '2022-02',
        count: 6,
      },
      {
        day: '2022-10',
        count: 8,
      },
      {
        day: '2022-11',
        count: 24,
      },
      {
        day: '2022-12',
        count: 7,
      },
      {
        day: '2023-01',
        count: 11,
      },
      {
        day: '2023-02',
        count: 24,
      },
      {
        day: '2023-03',
        count: 2,
      },
    ],
    viirs_alerts_daily: [],
    tree_cover_extent_total: 111763.3113,
    Country: 'Argentina',
    State: 'Chaco',
    'Sub State': 'Presidencia de la Plaza',
    name_all: 'Argentina--Chaco--Presidencia de la Plaza',
    gadmid: 'ARG.3.17',
    gadmid_2: 'ARG.3.17',
    gadmid_2_lat: -27.034819141438057,
    gadmid_2_lon: -59.791889606277486,
    gadmid_1: 'ARG.3',
    gadmid_1_lat: -26.38737547560391,
    gadmid_1_lon: -60.766741050280565,
    gadmid_0: 'ARG',
    gadmid_0_lat: -35.38996674867808,
    gadmid_0_lon: -65.1669824158997,
    location_lat: -27.03480718,
    location_lon: -59.79187348,
    location_name: 'Presidencia de la Plaza',
    fire: [],
    fireAlerts: true,
    umd: 111763.3113,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
  {
    list_id: 5479,
    location_id: 28,
    gadm_id: 'ARG.3.22',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-02-11',
        count: 2,
      },
      {
        day: '2021-02-27',
        count: 2,
      },
      {
        day: '2021-03-07',
        count: 2,
      },
      {
        day: '2021-07-21',
        count: 1,
      },
      {
        day: '2021-08-14',
        count: 2,
      },
      {
        day: '2021-08-30',
        count: 2,
      },
      {
        day: '2021-09-15',
        count: 8,
      },
      {
        day: '2021-10-17',
        count: 1,
      },
      {
        day: '2021-10-25',
        count: 51,
      },
      {
        day: '2021-11-02',
        count: 15,
      },
      {
        day: '2021-11-26',
        count: 2,
      },
      {
        day: '2022-01-29',
        count: 1,
      },
      {
        day: '2022-02-06',
        count: 3,
      },
      {
        day: '2022-03-26',
        count: 1,
      },
      {
        day: '2022-06-14',
        count: 10,
      },
      {
        day: '2022-10-04',
        count: 8,
      },
      {
        day: '2022-10-23',
        count: 13,
      },
      {
        day: '2022-11-05',
        count: 13,
      },
      {
        day: '2022-11-26',
        count: 9,
      },
      {
        day: '2022-12-07',
        count: 28,
      },
      {
        day: '2022-12-23',
        count: 4,
      },
      {
        day: '2022-12-30',
        count: 13,
      },
      {
        day: '2023-01-04',
        count: 2,
      },
      {
        day: '2023-01-16',
        count: 2,
      },
      {
        day: '2023-01-21',
        count: 1,
      },
      {
        day: '2023-01-24',
        count: 10,
      },
      {
        day: '2023-02-07',
        count: 1,
      },
      {
        day: '2023-02-25',
        count: 7,
      },
      {
        day: '2023-03-01',
        count: 2,
      },
      {
        day: '2023-03-13',
        count: 2,
      },
      {
        day: '2023-03-29',
        count: 1,
      },
      {
        day: '2023-04-22',
        count: 3,
      },
      {
        day: '2023-04-30',
        count: 2,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2021-06',
        count: 2,
      },
      {
        day: '2021-08',
        count: 2,
      },
      {
        day: '2021-09',
        count: 2,
      },
      {
        day: '2021-29',
        count: 1,
      },
      {
        day: '2021-32',
        count: 2,
      },
      {
        day: '2021-35',
        count: 2,
      },
      {
        day: '2021-37',
        count: 8,
      },
      {
        day: '2021-41',
        count: 1,
      },
      {
        day: '2021-43',
        count: 51,
      },
      {
        day: '2021-44',
        count: 15,
      },
      {
        day: '2021-47',
        count: 2,
      },
      {
        day: '2022-04',
        count: 1,
      },
      {
        day: '2022-05',
        count: 3,
      },
      {
        day: '2022-12',
        count: 1,
      },
      {
        day: '2022-24',
        count: 10,
      },
      {
        day: '2022-40',
        count: 8,
      },
      {
        day: '2022-42',
        count: 13,
      },
      {
        day: '2022-44',
        count: 13,
      },
      {
        day: '2022-47',
        count: 9,
      },
      {
        day: '2022-49',
        count: 28,
      },
      {
        day: '2022-51',
        count: 4,
      },
      {
        day: '2022-52',
        count: 13,
      },
      {
        day: '2023-01',
        count: 2,
      },
      {
        day: '2023-03',
        count: 3,
      },
      {
        day: '2023-04',
        count: 10,
      },
      {
        day: '2023-06',
        count: 1,
      },
      {
        day: '2023-08',
        count: 7,
      },
      {
        day: '2023-09',
        count: 2,
      },
      {
        day: '2023-11',
        count: 2,
      },
      {
        day: '2023-13',
        count: 1,
      },
      {
        day: '2023-16',
        count: 3,
      },
      {
        day: '2023-17',
        count: 2,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-02',
        count: 4,
      },
      {
        day: '2021-03',
        count: 2,
      },
      {
        day: '2021-07',
        count: 1,
      },
      {
        day: '2021-08',
        count: 4,
      },
      {
        day: '2021-09',
        count: 8,
      },
      {
        day: '2021-10',
        count: 52,
      },
      {
        day: '2021-11',
        count: 17,
      },
      {
        day: '2022-01',
        count: 1,
      },
      {
        day: '2022-02',
        count: 3,
      },
      {
        day: '2022-03',
        count: 1,
      },
      {
        day: '2022-06',
        count: 10,
      },
      {
        day: '2022-10',
        count: 21,
      },
      {
        day: '2022-11',
        count: 22,
      },
      {
        day: '2022-12',
        count: 45,
      },
      {
        day: '2023-01',
        count: 15,
      },
      {
        day: '2023-02',
        count: 8,
      },
      {
        day: '2023-03',
        count: 5,
      },
      {
        day: '2023-04',
        count: 5,
      },
    ],
    viirs_alerts_daily: [],
    tree_cover_extent_total: 90265.8177,
    Country: 'Argentina',
    State: 'Chaco',
    'Sub State': 'Sargento Cabral',
    name_all: 'Argentina--Chaco--Sargento Cabral',
    gadmid: 'ARG.3.22',
    gadmid_2: 'ARG.3.22',
    gadmid_2_lat: -26.786232791099366,
    gadmid_2_lon: -59.53876100007566,
    gadmid_1: 'ARG.3',
    gadmid_1_lat: -26.38737547560391,
    gadmid_1_lon: -60.766741050280565,
    gadmid_0: 'ARG',
    gadmid_0_lat: -35.38996674867808,
    gadmid_0_lon: -65.1669824158997,
    location_lat: -26.78624821,
    location_lon: -59.53873195,
    location_name: 'Sargento Cabral',
    fire: [],
    fireAlerts: true,
    umd: 90265.8177,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
  {
    list_id: 5479,
    location_id: -1,
    gadm_id: 'ARG.22.2',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-25',
        count: 1,
      },
      {
        day: '2021-02-17',
        count: 98,
      },
      {
        day: '2021-02-26',
        count: 7,
      },
      {
        day: '2021-03-05',
        count: 131,
      },
      {
        day: '2021-03-06',
        count: 206,
      },
      {
        day: '2021-03-29',
        count: 230,
      },
      {
        day: '2021-03-30',
        count: 1365,
      },
      {
        day: '2021-04-07',
        count: 20,
      },
      {
        day: '2021-04-14',
        count: 1,
      },
      {
        day: '2021-04-30',
        count: 7,
      },
      {
        day: '2021-05-08',
        count: 2,
      },
      {
        day: '2021-05-24',
        count: 3,
      },
      {
        day: '2021-07-27',
        count: 22,
      },
      {
        day: '2021-09-14',
        count: 13,
      },
      {
        day: '2021-10-07',
        count: 17,
      },
      {
        day: '2021-10-08',
        count: 10,
      },
      {
        day: '2021-10-15',
        count: 20,
      },
      {
        day: '2021-10-16',
        count: 340,
      },
      {
        day: '2021-10-23',
        count: 8,
      },
      {
        day: '2021-10-24',
        count: 3246,
      },
      {
        day: '2021-10-31',
        count: 23,
      },
      {
        day: '2021-11-01',
        count: 14,
      },
      {
        day: '2021-11-09',
        count: 736,
      },
      {
        day: '2021-11-24',
        count: 272,
      },
      {
        day: '2021-11-25',
        count: 61,
      },
      {
        day: '2021-12-02',
        count: 5769,
      },
      {
        day: '2021-12-11',
        count: 34,
      },
      {
        day: '2021-12-18',
        count: 513,
      },
      {
        day: '2021-12-19',
        count: 99,
      },
      {
        day: '2021-12-26',
        count: 100,
      },
      {
        day: '2021-12-27',
        count: 115,
      },
      {
        day: '2022-01-03',
        count: 3,
      },
      {
        day: '2022-01-11',
        count: 1,
      },
      {
        day: '2022-01-28',
        count: 13,
      },
      {
        day: '2022-02-05',
        count: 16,
      },
      {
        day: '2022-02-13',
        count: 10,
      },
      {
        day: '2022-02-20',
        count: 1660,
      },
      {
        day: '2022-03-16',
        count: 1118,
      },
      {
        day: '2022-03-25',
        count: 107,
      },
      {
        day: '2022-04-01',
        count: 157,
      },
      {
        day: '2022-04-18',
        count: 4,
      },
      {
        day: '2022-09-07',
        count: 1,
      },
      {
        day: '2022-09-12',
        count: 1,
      },
      {
        day: '2022-10-11',
        count: 47,
      },
      {
        day: '2022-10-27',
        count: 64,
      },
      {
        day: '2022-10-28',
        count: 4,
      },
      {
        day: '2022-11-02',
        count: 22,
      },
      {
        day: '2022-11-03',
        count: 5,
      },
      {
        day: '2022-11-14',
        count: 16,
      },
      {
        day: '2022-11-19',
        count: 232,
      },
      {
        day: '2022-11-28',
        count: 158,
      },
      {
        day: '2022-12-05',
        count: 58,
      },
      {
        day: '2022-12-06',
        count: 12,
      },
      {
        day: '2022-12-14',
        count: 241,
      },
      {
        day: '2022-12-21',
        count: 22,
      },
      {
        day: '2022-12-23',
        count: 6,
      },
      {
        day: '2022-12-30',
        count: 230,
      },
      {
        day: '2023-01-06',
        count: 29,
      },
      {
        day: '2023-01-09',
        count: 26,
      },
      {
        day: '2023-01-14',
        count: 101,
      },
      {
        day: '2023-01-15',
        count: 170,
      },
      {
        day: '2023-01-22',
        count: 23,
      },
      {
        day: '2023-01-31',
        count: 108,
      },
      {
        day: '2023-02-07',
        count: 18,
      },
      {
        day: '2023-02-12',
        count: 15,
      },
      {
        day: '2023-03-04',
        count: 498,
      },
      {
        day: '2023-03-06',
        count: 174,
      },
      {
        day: '2023-03-11',
        count: 867,
      },
      {
        day: '2023-03-23',
        count: 60,
      },
      {
        day: '2023-03-27',
        count: 276,
      },
      {
        day: '2023-03-28',
        count: 138,
      },
      {
        day: '2023-04-12',
        count: 340,
      },
      {
        day: '2023-04-20',
        count: 209,
      },
      {
        day: '2023-04-28',
        count: 36,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2021-04',
        count: 1,
      },
      {
        day: '2021-07',
        count: 98,
      },
      {
        day: '2021-08',
        count: 7,
      },
      {
        day: '2021-09',
        count: 337,
      },
      {
        day: '2021-13',
        count: 1595,
      },
      {
        day: '2021-14',
        count: 20,
      },
      {
        day: '2021-15',
        count: 1,
      },
      {
        day: '2021-17',
        count: 7,
      },
      {
        day: '2021-18',
        count: 2,
      },
      {
        day: '2021-21',
        count: 3,
      },
      {
        day: '2021-30',
        count: 22,
      },
      {
        day: '2021-37',
        count: 13,
      },
      {
        day: '2021-40',
        count: 27,
      },
      {
        day: '2021-41',
        count: 360,
      },
      {
        day: '2021-42',
        count: 3254,
      },
      {
        day: '2021-43',
        count: 23,
      },
      {
        day: '2021-44',
        count: 14,
      },
      {
        day: '2021-45',
        count: 736,
      },
      {
        day: '2021-47',
        count: 333,
      },
      {
        day: '2021-48',
        count: 5769,
      },
      {
        day: '2021-49',
        count: 34,
      },
      {
        day: '2021-50',
        count: 612,
      },
      {
        day: '2021-51',
        count: 100,
      },
      {
        day: '2021-52',
        count: 115,
      },
      {
        day: '2022-01',
        count: 3,
      },
      {
        day: '2022-02',
        count: 1,
      },
      {
        day: '2022-04',
        count: 13,
      },
      {
        day: '2022-05',
        count: 16,
      },
      {
        day: '2022-06',
        count: 10,
      },
      {
        day: '2022-07',
        count: 1660,
      },
      {
        day: '2022-11',
        count: 1118,
      },
      {
        day: '2022-12',
        count: 107,
      },
      {
        day: '2022-13',
        count: 157,
      },
      {
        day: '2022-16',
        count: 4,
      },
      {
        day: '2022-36',
        count: 1,
      },
      {
        day: '2022-37',
        count: 1,
      },
      {
        day: '2022-41',
        count: 47,
      },
      {
        day: '2022-43',
        count: 68,
      },
      {
        day: '2022-44',
        count: 27,
      },
      {
        day: '2022-46',
        count: 248,
      },
      {
        day: '2022-48',
        count: 158,
      },
      {
        day: '2022-49',
        count: 70,
      },
      {
        day: '2022-50',
        count: 241,
      },
      {
        day: '2022-51',
        count: 28,
      },
      {
        day: '2022-52',
        count: 230,
      },
      {
        day: '2023-01',
        count: 29,
      },
      {
        day: '2023-02',
        count: 297,
      },
      {
        day: '2023-03',
        count: 23,
      },
      {
        day: '2023-05',
        count: 108,
      },
      {
        day: '2023-06',
        count: 33,
      },
      {
        day: '2023-09',
        count: 498,
      },
      {
        day: '2023-10',
        count: 1041,
      },
      {
        day: '2023-12',
        count: 60,
      },
      {
        day: '2023-13',
        count: 414,
      },
      {
        day: '2023-15',
        count: 340,
      },
      {
        day: '2023-16',
        count: 209,
      },
      {
        day: '2023-17',
        count: 36,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1,
      },
      {
        day: '2021-02',
        count: 105,
      },
      {
        day: '2021-03',
        count: 1932,
      },
      {
        day: '2021-04',
        count: 28,
      },
      {
        day: '2021-05',
        count: 5,
      },
      {
        day: '2021-07',
        count: 22,
      },
      {
        day: '2021-09',
        count: 13,
      },
      {
        day: '2021-10',
        count: 3664,
      },
      {
        day: '2021-11',
        count: 1083,
      },
      {
        day: '2021-12',
        count: 6630,
      },
      {
        day: '2022-01',
        count: 17,
      },
      {
        day: '2022-02',
        count: 1686,
      },
      {
        day: '2022-03',
        count: 1225,
      },
      {
        day: '2022-04',
        count: 161,
      },
      {
        day: '2022-09',
        count: 2,
      },
      {
        day: '2022-10',
        count: 115,
      },
      {
        day: '2022-11',
        count: 433,
      },
      {
        day: '2022-12',
        count: 569,
      },
      {
        day: '2023-01',
        count: 457,
      },
      {
        day: '2023-02',
        count: 33,
      },
      {
        day: '2023-03',
        count: 2013,
      },
      {
        day: '2023-04',
        count: 585,
      },
    ],
    viirs_alerts_daily: [],
    tree_cover_extent_total: 331949.9152,
    Country: 'Argentina',
    State: 'Santiago del Estero',
    'Sub State': 'Alberdi',
    name_all: 'Argentina--Santiago del Estero--Alberdi',
    gadmid: 'ARG.22.2',
    gadmid_2: 'ARG.22.2',
    gadmid_2_lat: -26.532425420812142,
    gadmid_2_lon: -62.74235527761274,
    gadmid_1: 'ARG.22',
    gadmid_1_lat: -27.78222965319164,
    gadmid_1_lon: -63.25847620397957,
    gadmid_0: 'ARG',
    gadmid_0_lat: -35.38996674867808,
    gadmid_0_lon: -65.1669824158997,
    location_lat: null,
    location_lon: null,
    location_name: null,
    fire: [],
    fireAlerts: true,
    umd: 331949.9152,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
  {
    list_id: 5479,
    location_id: -1,
    gadm_id: 'BRA.12.42',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-12',
        count: 676,
      },
      {
        day: '2021-01-20',
        count: 8,
      },
      {
        day: '2021-01-28',
        count: 496,
      },
      {
        day: '2021-02-13',
        count: 122,
      },
      {
        day: '2021-03-17',
        count: 1,
      },
      {
        day: '2021-04-10',
        count: 2677,
      },
      {
        day: '2021-05-04',
        count: 1960,
      },
      {
        day: '2021-05-12',
        count: 811,
      },
      {
        day: '2021-05-20',
        count: 482,
      },
      {
        day: '2021-06-05',
        count: 254,
      },
      {
        day: '2021-06-13',
        count: 262,
      },
      {
        day: '2021-06-21',
        count: 260,
      },
      {
        day: '2021-06-29',
        count: 503,
      },
      {
        day: '2021-07-07',
        count: 91,
      },
      {
        day: '2021-07-15',
        count: 353,
      },
      {
        day: '2021-07-23',
        count: 259,
      },
      {
        day: '2021-07-31',
        count: 392,
      },
      {
        day: '2021-08-08',
        count: 91,
      },
      {
        day: '2021-08-16',
        count: 1871,
      },
      {
        day: '2021-08-24',
        count: 6326,
      },
      {
        day: '2021-09-01',
        count: 8958,
      },
      {
        day: '2021-09-17',
        count: 32552,
      },
      {
        day: '2021-09-25',
        count: 9255,
      },
      {
        day: '2021-10-03',
        count: 57911,
      },
      {
        day: '2021-10-11',
        count: 13,
      },
      {
        day: '2021-10-27',
        count: 9747,
      },
      {
        day: '2021-11-04',
        count: 4649,
      },
      {
        day: '2021-11-28',
        count: 13139,
      },
      {
        day: '2022-01-15',
        count: 2009,
      },
      {
        day: '2022-01-23',
        count: 1522,
      },
      {
        day: '2022-02-08',
        count: 4,
      },
      {
        day: '2022-02-16',
        count: 3,
      },
      {
        day: '2022-02-24',
        count: 99,
      },
      {
        day: '2022-03-20',
        count: 40,
      },
      {
        day: '2022-03-28',
        count: 1176,
      },
      {
        day: '2022-04-05',
        count: 92,
      },
      {
        day: '2022-04-13',
        count: 162,
      },
      {
        day: '2022-04-29',
        count: 168,
      },
      {
        day: '2022-05-15',
        count: 119,
      },
      {
        day: '2022-05-31',
        count: 369,
      },
      {
        day: '2022-06-16',
        count: 237,
      },
      {
        day: '2022-07-02',
        count: 124,
      },
      {
        day: '2022-07-18',
        count: 305,
      },
      {
        day: '2022-08-03',
        count: 226,
      },
      {
        day: '2022-08-18',
        count: 34,
      },
      {
        day: '2022-08-19',
        count: 97,
      },
      {
        day: '2022-08-23',
        count: 22,
      },
      {
        day: '2022-09-04',
        count: 1710,
      },
      {
        day: '2022-09-09',
        count: 52,
      },
      {
        day: '2022-09-20',
        count: 256,
      },
      {
        day: '2022-09-21',
        count: 52,
      },
      {
        day: '2022-09-26',
        count: 633,
      },
      {
        day: '2022-10-06',
        count: 1457,
      },
      {
        day: '2022-10-08',
        count: 850,
      },
      {
        day: '2022-10-13',
        count: 102,
      },
      {
        day: '2022-10-30',
        count: 39,
      },
      {
        day: '2022-11-07',
        count: 3650,
      },
      {
        day: '2022-11-23',
        count: 2025,
      },
      {
        day: '2022-11-28',
        count: 1,
      },
      {
        day: '2022-12-03',
        count: 28,
      },
      {
        day: '2023-01-11',
        count: 8,
      },
      {
        day: '2023-02-09',
        count: 471,
      },
      {
        day: '2023-02-11',
        count: 3255,
      },
      {
        day: '2023-02-14',
        count: 77,
      },
      {
        day: '2023-02-19',
        count: 2,
      },
      {
        day: '2023-02-27',
        count: 109,
      },
      {
        day: '2023-03-03',
        count: 23,
      },
      {
        day: '2023-03-15',
        count: 457,
      },
      {
        day: '2023-03-25',
        count: 3763,
      },
      {
        day: '2023-03-30',
        count: 23,
      },
      {
        day: '2023-03-31',
        count: 268,
      },
      {
        day: '2023-04-16',
        count: 405,
      },
      {
        day: '2023-04-24',
        count: 176,
      },
      {
        day: '2023-05-02',
        count: 363,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2021-02',
        count: 676,
      },
      {
        day: '2021-03',
        count: 8,
      },
      {
        day: '2021-04',
        count: 496,
      },
      {
        day: '2021-06',
        count: 122,
      },
      {
        day: '2021-11',
        count: 1,
      },
      {
        day: '2021-14',
        count: 2677,
      },
      {
        day: '2021-18',
        count: 1960,
      },
      {
        day: '2021-19',
        count: 811,
      },
      {
        day: '2021-20',
        count: 482,
      },
      {
        day: '2021-22',
        count: 254,
      },
      {
        day: '2021-23',
        count: 262,
      },
      {
        day: '2021-25',
        count: 260,
      },
      {
        day: '2021-26',
        count: 503,
      },
      {
        day: '2021-27',
        count: 91,
      },
      {
        day: '2021-28',
        count: 353,
      },
      {
        day: '2021-29',
        count: 259,
      },
      {
        day: '2021-30',
        count: 392,
      },
      {
        day: '2021-31',
        count: 91,
      },
      {
        day: '2021-33',
        count: 1871,
      },
      {
        day: '2021-34',
        count: 6326,
      },
      {
        day: '2021-35',
        count: 8958,
      },
      {
        day: '2021-37',
        count: 32552,
      },
      {
        day: '2021-38',
        count: 9255,
      },
      {
        day: '2021-39',
        count: 57911,
      },
      {
        day: '2021-41',
        count: 13,
      },
      {
        day: '2021-43',
        count: 9747,
      },
      {
        day: '2021-44',
        count: 4649,
      },
      {
        day: '2021-47',
        count: 13139,
      },
      {
        day: '2022-02',
        count: 2009,
      },
      {
        day: '2022-03',
        count: 1522,
      },
      {
        day: '2022-06',
        count: 4,
      },
      {
        day: '2022-07',
        count: 3,
      },
      {
        day: '2022-08',
        count: 99,
      },
      {
        day: '2022-11',
        count: 40,
      },
      {
        day: '2022-13',
        count: 1176,
      },
      {
        day: '2022-14',
        count: 92,
      },
      {
        day: '2022-15',
        count: 162,
      },
      {
        day: '2022-17',
        count: 168,
      },
      {
        day: '2022-19',
        count: 119,
      },
      {
        day: '2022-22',
        count: 369,
      },
      {
        day: '2022-24',
        count: 237,
      },
      {
        day: '2022-26',
        count: 124,
      },
      {
        day: '2022-29',
        count: 305,
      },
      {
        day: '2022-31',
        count: 226,
      },
      {
        day: '2022-33',
        count: 131,
      },
      {
        day: '2022-34',
        count: 22,
      },
      {
        day: '2022-35',
        count: 1710,
      },
      {
        day: '2022-36',
        count: 52,
      },
      {
        day: '2022-38',
        count: 308,
      },
      {
        day: '2022-39',
        count: 633,
      },
      {
        day: '2022-40',
        count: 2307,
      },
      {
        day: '2022-41',
        count: 102,
      },
      {
        day: '2022-43',
        count: 39,
      },
      {
        day: '2022-45',
        count: 3650,
      },
      {
        day: '2022-47',
        count: 2025,
      },
      {
        day: '2022-48',
        count: 29,
      },
      {
        day: '2023-02',
        count: 8,
      },
      {
        day: '2023-06',
        count: 3726,
      },
      {
        day: '2023-07',
        count: 79,
      },
      {
        day: '2023-09',
        count: 132,
      },
      {
        day: '2023-11',
        count: 457,
      },
      {
        day: '2023-12',
        count: 3763,
      },
      {
        day: '2023-13',
        count: 291,
      },
      {
        day: '2023-15',
        count: 405,
      },
      {
        day: '2023-17',
        count: 176,
      },
      {
        day: '2023-18',
        count: 363,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1180,
      },
      {
        day: '2021-02',
        count: 122,
      },
      {
        day: '2021-03',
        count: 1,
      },
      {
        day: '2021-04',
        count: 2677,
      },
      {
        day: '2021-05',
        count: 3253,
      },
      {
        day: '2021-06',
        count: 1279,
      },
      {
        day: '2021-07',
        count: 1095,
      },
      {
        day: '2021-08',
        count: 8288,
      },
      {
        day: '2021-09',
        count: 50765,
      },
      {
        day: '2021-10',
        count: 67671,
      },
      {
        day: '2021-11',
        count: 17788,
      },
      {
        day: '2022-01',
        count: 3531,
      },
      {
        day: '2022-02',
        count: 106,
      },
      {
        day: '2022-03',
        count: 1216,
      },
      {
        day: '2022-04',
        count: 422,
      },
      {
        day: '2022-05',
        count: 488,
      },
      {
        day: '2022-06',
        count: 237,
      },
      {
        day: '2022-07',
        count: 429,
      },
      {
        day: '2022-08',
        count: 379,
      },
      {
        day: '2022-09',
        count: 2703,
      },
      {
        day: '2022-10',
        count: 2448,
      },
      {
        day: '2022-11',
        count: 5676,
      },
      {
        day: '2022-12',
        count: 28,
      },
      {
        day: '2023-01',
        count: 8,
      },
      {
        day: '2023-02',
        count: 3914,
      },
      {
        day: '2023-03',
        count: 4534,
      },
      {
        day: '2023-04',
        count: 581,
      },
      {
        day: '2023-05',
        count: 363,
      },
    ],
    viirs_alerts_daily: [
      {
        day: '2023-04-16',
        count: 4,
      },
      {
        day: '2023-04-17',
        count: 1,
      },
      {
        day: '2023-04-19',
        count: 2,
      },
      {
        day: '2023-04-21',
        count: 2,
      },
      {
        day: '2023-04-22',
        count: 3,
      },
      {
        day: '2023-04-25',
        count: 4,
      },
      {
        day: '2023-04-27',
        count: 2,
      },
      {
        day: '2023-04-28',
        count: 13,
      },
      {
        day: '2023-04-29',
        count: 15,
      },
      {
        day: '2023-04-30',
        count: 6,
      },
      {
        day: '2023-05-01',
        count: 4,
      },
    ],
    tree_cover_extent_total: 1178321.9811,
    Country: 'Brazil',
    State: 'Mato Grosso',
    'Sub State': 'Gaúcha do Norte',
    name_all: 'Brazil--Mato Grosso--Gaúcha do Norte',
    gadmid: 'BRA.12.42',
    gadmid_2: 'BRA.12.42',
    gadmid_2_lat: -12.996265427980854,
    gadmid_2_lon: -53.45596762918367,
    gadmid_1: 'BRA.12',
    gadmid_1_lat: -12.9495997422582,
    gadmid_1_lon: -55.919201371905686,
    gadmid_0: 'BRA',
    gadmid_0_lat: -10.743642753226414,
    gadmid_0_lon: -53.07657618709698,
    location_lat: null,
    location_lon: null,
    location_name: null,
    fire: [
      {
        day: '2023-04-16',
        count: 4,
      },
      {
        day: '2023-04-17',
        count: 1,
      },
      {
        day: '2023-04-19',
        count: 2,
      },
      {
        day: '2023-04-21',
        count: 2,
      },
      {
        day: '2023-04-22',
        count: 3,
      },
      {
        day: '2023-04-25',
        count: 4,
      },
      {
        day: '2023-04-27',
        count: 2,
      },
      {
        day: '2023-04-28',
        count: 13,
      },
      {
        day: '2023-04-29',
        count: 15,
      },
      {
        day: '2023-04-30',
        count: 6,
      },
      {
        day: '2023-05-01',
        count: 4,
      },
    ],
    fireAlerts: true,
    umd: 1178321.9811,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
  {
    list_id: 5479,
    location_id: -1,
    gadm_id: 'ARG.3.10',
    gladAlerts: true,
    glad_alerts_daily: [
      {
        day: '2021-01-02',
        count: 1,
      },
      {
        day: '2021-02-18',
        count: 22,
      },
      {
        day: '2021-02-26',
        count: 324,
      },
      {
        day: '2021-03-07',
        count: 3,
      },
      {
        day: '2021-03-30',
        count: 109,
      },
      {
        day: '2021-03-31',
        count: 2,
      },
      {
        day: '2021-04-07',
        count: 11,
      },
      {
        day: '2021-04-15',
        count: 85,
      },
      {
        day: '2021-06-10',
        count: 1,
      },
      {
        day: '2021-08-13',
        count: 1,
      },
      {
        day: '2021-09-14',
        count: 2,
      },
      {
        day: '2021-09-15',
        count: 5,
      },
      {
        day: '2021-10-16',
        count: 15,
      },
      {
        day: '2021-10-17',
        count: 36,
      },
      {
        day: '2021-10-24',
        count: 471,
      },
      {
        day: '2021-10-25',
        count: 6,
      },
      {
        day: '2021-11-01',
        count: 7,
      },
      {
        day: '2021-11-02',
        count: 12,
      },
      {
        day: '2021-11-09',
        count: 285,
      },
      {
        day: '2021-11-18',
        count: 6,
      },
      {
        day: '2021-11-25',
        count: 22,
      },
      {
        day: '2021-11-26',
        count: 2,
      },
      {
        day: '2021-12-03',
        count: 36,
      },
      {
        day: '2021-12-19',
        count: 13,
      },
      {
        day: '2021-12-27',
        count: 135,
      },
      {
        day: '2022-01-12',
        count: 9,
      },
      {
        day: '2022-03-17',
        count: 1,
      },
      {
        day: '2022-03-25',
        count: 125,
      },
      {
        day: '2022-04-18',
        count: 63,
      },
      {
        day: '2022-05-04',
        count: 16,
      },
      {
        day: '2022-05-20',
        count: 1,
      },
      {
        day: '2022-08-16',
        count: 4,
      },
      {
        day: '2022-08-24',
        count: 20,
      },
      {
        day: '2022-09-07',
        count: 1,
      },
      {
        day: '2022-09-24',
        count: 10,
      },
      {
        day: '2022-10-06',
        count: 6,
      },
      {
        day: '2022-10-11',
        count: 1019,
      },
      {
        day: '2022-10-23',
        count: 11,
      },
      {
        day: '2022-10-27',
        count: 364,
      },
      {
        day: '2022-10-28',
        count: 58,
      },
      {
        day: '2022-11-05',
        count: 101,
      },
      {
        day: '2022-11-09',
        count: 2,
      },
      {
        day: '2022-11-12',
        count: 24,
      },
      {
        day: '2022-11-14',
        count: 9,
      },
      {
        day: '2022-11-28',
        count: 647,
      },
      {
        day: '2022-12-07',
        count: 43,
      },
      {
        day: '2022-12-14',
        count: 554,
      },
      {
        day: '2022-12-23',
        count: 2,
      },
      {
        day: '2022-12-30',
        count: 724,
      },
      {
        day: '2023-01-04',
        count: 182,
      },
      {
        day: '2023-01-08',
        count: 1,
      },
      {
        day: '2023-01-15',
        count: 220,
      },
      {
        day: '2023-01-21',
        count: 80,
      },
      {
        day: '2023-01-24',
        count: 42,
      },
      {
        day: '2023-01-26',
        count: 2,
      },
      {
        day: '2023-01-31',
        count: 4,
      },
      {
        day: '2023-02-09',
        count: 25,
      },
      {
        day: '2023-02-12',
        count: 66,
      },
      {
        day: '2023-02-25',
        count: 1,
      },
      {
        day: '2023-03-01',
        count: 17,
      },
      {
        day: '2023-03-04',
        count: 165,
      },
      {
        day: '2023-03-06',
        count: 25,
      },
      {
        day: '2023-03-13',
        count: 4,
      },
      {
        day: '2023-03-20',
        count: 60,
      },
      {
        day: '2023-03-23',
        count: 154,
      },
      {
        day: '2023-03-29',
        count: 21,
      },
      {
        day: '2023-04-06',
        count: 1,
      },
      {
        day: '2023-04-22',
        count: 20,
      },
      {
        day: '2023-04-29',
        count: 458,
      },
      {
        day: '2023-04-30',
        count: 24,
      },
    ],
    glad_alerts_weekly: [
      {
        day: '2020-53',
        count: 1,
      },
      {
        day: '2021-07',
        count: 22,
      },
      {
        day: '2021-08',
        count: 324,
      },
      {
        day: '2021-09',
        count: 3,
      },
      {
        day: '2021-13',
        count: 111,
      },
      {
        day: '2021-14',
        count: 11,
      },
      {
        day: '2021-15',
        count: 85,
      },
      {
        day: '2021-23',
        count: 1,
      },
      {
        day: '2021-32',
        count: 1,
      },
      {
        day: '2021-37',
        count: 7,
      },
      {
        day: '2021-41',
        count: 51,
      },
      {
        day: '2021-42',
        count: 471,
      },
      {
        day: '2021-43',
        count: 6,
      },
      {
        day: '2021-44',
        count: 19,
      },
      {
        day: '2021-45',
        count: 285,
      },
      {
        day: '2021-46',
        count: 6,
      },
      {
        day: '2021-47',
        count: 24,
      },
      {
        day: '2021-48',
        count: 36,
      },
      {
        day: '2021-50',
        count: 13,
      },
      {
        day: '2021-52',
        count: 135,
      },
      {
        day: '2022-02',
        count: 9,
      },
      {
        day: '2022-11',
        count: 1,
      },
      {
        day: '2022-12',
        count: 125,
      },
      {
        day: '2022-16',
        count: 63,
      },
      {
        day: '2022-18',
        count: 16,
      },
      {
        day: '2022-20',
        count: 1,
      },
      {
        day: '2022-33',
        count: 4,
      },
      {
        day: '2022-34',
        count: 20,
      },
      {
        day: '2022-36',
        count: 1,
      },
      {
        day: '2022-38',
        count: 10,
      },
      {
        day: '2022-40',
        count: 6,
      },
      {
        day: '2022-41',
        count: 1019,
      },
      {
        day: '2022-42',
        count: 11,
      },
      {
        day: '2022-43',
        count: 422,
      },
      {
        day: '2022-44',
        count: 101,
      },
      {
        day: '2022-45',
        count: 26,
      },
      {
        day: '2022-46',
        count: 9,
      },
      {
        day: '2022-48',
        count: 647,
      },
      {
        day: '2022-49',
        count: 43,
      },
      {
        day: '2022-50',
        count: 554,
      },
      {
        day: '2022-51',
        count: 2,
      },
      {
        day: '2022-52',
        count: 724,
      },
      {
        day: '2023-01',
        count: 183,
      },
      {
        day: '2023-02',
        count: 220,
      },
      {
        day: '2023-03',
        count: 80,
      },
      {
        day: '2023-04',
        count: 44,
      },
      {
        day: '2023-05',
        count: 4,
      },
      {
        day: '2023-06',
        count: 91,
      },
      {
        day: '2023-08',
        count: 1,
      },
      {
        day: '2023-09',
        count: 182,
      },
      {
        day: '2023-10',
        count: 25,
      },
      {
        day: '2023-11',
        count: 4,
      },
      {
        day: '2023-12',
        count: 214,
      },
      {
        day: '2023-13',
        count: 21,
      },
      {
        day: '2023-14',
        count: 1,
      },
      {
        day: '2023-16',
        count: 20,
      },
      {
        day: '2023-17',
        count: 482,
      },
    ],
    glad_alerts_monthly: [
      {
        day: '2021-01',
        count: 1,
      },
      {
        day: '2021-02',
        count: 346,
      },
      {
        day: '2021-03',
        count: 114,
      },
      {
        day: '2021-04',
        count: 96,
      },
      {
        day: '2021-06',
        count: 1,
      },
      {
        day: '2021-08',
        count: 1,
      },
      {
        day: '2021-09',
        count: 7,
      },
      {
        day: '2021-10',
        count: 528,
      },
      {
        day: '2021-11',
        count: 334,
      },
      {
        day: '2021-12',
        count: 184,
      },
      {
        day: '2022-01',
        count: 9,
      },
      {
        day: '2022-03',
        count: 126,
      },
      {
        day: '2022-04',
        count: 63,
      },
      {
        day: '2022-05',
        count: 17,
      },
      {
        day: '2022-08',
        count: 24,
      },
      {
        day: '2022-09',
        count: 11,
      },
      {
        day: '2022-10',
        count: 1458,
      },
      {
        day: '2022-11',
        count: 783,
      },
      {
        day: '2022-12',
        count: 1323,
      },
      {
        day: '2023-01',
        count: 531,
      },
      {
        day: '2023-02',
        count: 92,
      },
      {
        day: '2023-03',
        count: 446,
      },
      {
        day: '2023-04',
        count: 503,
      },
    ],
    viirs_alerts_daily: [
      {
        day: '2023-04-02',
        count: 3,
      },
      {
        day: '2023-04-28',
        count: 1,
      },
    ],
    tree_cover_extent_total: 89080.1052,
    Country: 'Argentina',
    State: 'Chaco',
    'Sub State': 'Independencia',
    name_all: 'Argentina--Chaco--Independencia',
    gadmid: 'ARG.3.10',
    gadmid_2: 'ARG.3.10',
    gadmid_2_lat: -26.730130269181338,
    gadmid_2_lon: -60.76375334811772,
    gadmid_1: 'ARG.3',
    gadmid_1_lat: -26.38737547560391,
    gadmid_1_lon: -60.766741050280565,
    gadmid_0: 'ARG',
    gadmid_0_lat: -35.38996674867808,
    gadmid_0_lon: -65.1669824158997,
    location_lat: null,
    location_lon: null,
    location_name: null,
    fire: [
      {
        day: '2023-04-02',
        count: 3,
      },
      {
        day: '2023-04-28',
        count: 1,
      },
    ],
    fireAlerts: true,
    umd: 89080.1052,
    integratedAlertsDailyAllNominal:
      '{"2021-01-01":2,"2021-01-02":0,"2021-01-03":6,"2021-01-04":9,"2021-01-05":6,"2021-01-06":6,"2021-01-07":1,"2021-01-08":4,"2021-01-09":1,"2021-01-10":10,"2021-01-11":9,"2021-01-12":9,"2021-01-13":9,"2021-01-14":2,"2021-01-15":7,"2021-01-16":1,"2021-01-17":4,"2021-01-18":3,"2021-01-19":8,"2021-01-20":4,"2021-01-21":6,"2021-01-22":2,"2021-01-23":2,"2021-01-24":7,"2021-01-25":8,"2021-01-26":2,"2021-01-27":3,"2021-01-28":10,"2021-01-29":3,"2021-01-30":4,"2021-01-31":8}',
    integratedAlertsDailyAllHigh:
      '{"2021-01-01":1,"2021-01-02":5,"2021-01-03":0,"2021-01-04":2,"2021-01-05":0,"2021-01-06":8,"2021-01-07":4,"2021-01-08":7,"2021-01-09":5,"2021-01-10":0,"2021-01-11":3,"2021-01-12":4,"2021-01-13":7,"2021-01-14":1,"2021-01-15":2,"2021-01-16":0,"2021-01-17":1,"2021-01-18":3,"2021-01-19":10,"2021-01-20":0,"2021-01-21":1,"2021-01-22":2,"2021-01-23":4,"2021-01-24":1,"2021-01-25":5,"2021-01-26":5,"2021-01-27":5,"2021-01-28":4,"2021-01-29":6,"2021-01-30":6,"2021-01-31":6}',
    integratedAlertsDailyAllHighest:
      '{"2021-01-01":4,"2021-01-02":8,"2021-01-03":2,"2021-01-04":8,"2021-01-05":10,"2021-01-06":7,"2021-01-07":7,"2021-01-08":6,"2021-01-09":3,"2021-01-10":1,"2021-01-11":2,"2021-01-12":10,"2021-01-13":6,"2021-01-14":0,"2021-01-15":8,"2021-01-16":7,"2021-01-17":4,"2021-01-18":6,"2021-01-19":0,"2021-01-20":5,"2021-01-21":5,"2021-01-22":6,"2021-01-23":8,"2021-01-24":9,"2021-01-25":10,"2021-01-26":9,"2021-01-27":10,"2021-01-28":9,"2021-01-29":6,"2021-01-30":5,"2021-01-31":1}',
    integratedAlertsDailySbtnNominal:
      '{"2021-01-01":0,"2021-01-02":2,"2021-01-03":2,"2021-01-04":7,"2021-01-05":4,"2021-01-06":4,"2021-01-07":5,"2021-01-08":1,"2021-01-09":2,"2021-01-10":9,"2021-01-11":7,"2021-01-12":5,"2021-01-13":8,"2021-01-14":6,"2021-01-15":2,"2021-01-16":6,"2021-01-17":8,"2021-01-18":6,"2021-01-19":10,"2021-01-20":4,"2021-01-21":5,"2021-01-22":4,"2021-01-23":6,"2021-01-24":10,"2021-01-25":8,"2021-01-26":9,"2021-01-27":8,"2021-01-28":9,"2021-01-29":9,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailySbtnHigh:
      '{"2021-01-01":10,"2021-01-02":6,"2021-01-03":4,"2021-01-04":3,"2021-01-05":1,"2021-01-06":3,"2021-01-07":0,"2021-01-08":10,"2021-01-09":9,"2021-01-10":0,"2021-01-11":9,"2021-01-12":9,"2021-01-13":10,"2021-01-14":5,"2021-01-15":7,"2021-01-16":5,"2021-01-17":10,"2021-01-18":8,"2021-01-19":7,"2021-01-20":10,"2021-01-21":2,"2021-01-22":6,"2021-01-23":6,"2021-01-24":3,"2021-01-25":4,"2021-01-26":2,"2021-01-27":0,"2021-01-28":4,"2021-01-29":9,"2021-01-30":9,"2021-01-31":6}',
    integratedAlertsDailySbtnHighest:
      '{"2021-01-01":6,"2021-01-02":5,"2021-01-03":8,"2021-01-04":0,"2021-01-05":9,"2021-01-06":3,"2021-01-07":7,"2021-01-08":3,"2021-01-09":9,"2021-01-10":9,"2021-01-11":0,"2021-01-12":9,"2021-01-13":1,"2021-01-14":2,"2021-01-15":7,"2021-01-16":10,"2021-01-17":1,"2021-01-18":1,"2021-01-19":0,"2021-01-20":4,"2021-01-21":7,"2021-01-22":0,"2021-01-23":0,"2021-01-24":8,"2021-01-25":6,"2021-01-26":7,"2021-01-27":4,"2021-01-28":1,"2021-01-29":7,"2021-01-30":2,"2021-01-31":9}',
    integratedAlertsDailyJrcNominal:
      '{"2021-01-01":5,"2021-01-02":0,"2021-01-03":5,"2021-01-04":6,"2021-01-05":5,"2021-01-06":7,"2021-01-07":7,"2021-01-08":10,"2021-01-09":3,"2021-01-10":10,"2021-01-11":1,"2021-01-12":10,"2021-01-13":1,"2021-01-14":6,"2021-01-15":2,"2021-01-16":9,"2021-01-17":0,"2021-01-18":8,"2021-01-19":1,"2021-01-20":1,"2021-01-21":3,"2021-01-22":2,"2021-01-23":6,"2021-01-24":7,"2021-01-25":1,"2021-01-26":3,"2021-01-27":9,"2021-01-28":5,"2021-01-29":4,"2021-01-30":9,"2021-01-31":4}',
    integratedAlertsDailyJrcHigh:
      '{"2021-01-01":10,"2021-01-02":0,"2021-01-03":5,"2021-01-04":7,"2021-01-05":3,"2021-01-06":7,"2021-01-07":0,"2021-01-08":4,"2021-01-09":7,"2021-01-10":6,"2021-01-11":2,"2021-01-12":4,"2021-01-13":3,"2021-01-14":4,"2021-01-15":5,"2021-01-16":8,"2021-01-17":8,"2021-01-18":1,"2021-01-19":2,"2021-01-20":7,"2021-01-21":10,"2021-01-22":6,"2021-01-23":5,"2021-01-24":1,"2021-01-25":3,"2021-01-26":7,"2021-01-27":1,"2021-01-28":5,"2021-01-29":5,"2021-01-30":6,"2021-01-31":7}',
    integratedAlertsDailyJrcHighest:
      '{"2021-01-01":1,"2021-01-02":2,"2021-01-03":8,"2021-01-04":5,"2021-01-05":8,"2021-01-06":7,"2021-01-07":4,"2021-01-08":4,"2021-01-09":10,"2021-01-10":5,"2021-01-11":8,"2021-01-12":10,"2021-01-13":1,"2021-01-14":8,"2021-01-15":5,"2021-01-16":8,"2021-01-17":10,"2021-01-18":9,"2021-01-19":8,"2021-01-20":6,"2021-01-21":10,"2021-01-22":9,"2021-01-23":7,"2021-01-24":5,"2021-01-25":10,"2021-01-26":8,"2021-01-27":5,"2021-01-28":3,"2021-01-29":7,"2021-01-30":7,"2021-01-31":5}',
    totalHa: 100,
  },
];

export const ghgAnalysesData = [
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 2',
    totalAreaHa: 1256.1646821446757,
    statusCode: 2,
    locationError: null,
    commodity: 'SOYB',
    co2EmissionsFactor: '{"2021":20.8186,"2022":28.1142,"2023":10.0}',
    ch4EmissionsFactor: '{"2021":220.8186,"2022":228.1142,"2023":20.0}',
    n2oEmissionsFactor: '{"2021":320.8186,"2022":328.1142,"2023":3.0}',
    combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 3',
    totalAreaHa: 1256.4203696590005,
    statusCode: 2,
    locationError: null,
    commodity: 'SOYB',
    co2EmissionsFactor: '{"2021":40.8186,"2022":48.1142,"2023":410.0}',
    ch4EmissionsFactor: '{"2021":420.8186,"2022":428.1142,"2023":420.0}',
    n2oEmissionsFactor: '{"2021":420.8186,"2022":428.1142,"2023":43.0}',
    combinedEmissionsFactor: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 1',
    totalAreaHa: 1256.217339121448,
    statusCode: 2,
    locationError: null,
    commodity: 'SOYB',
    co2EmissionsFactor: '{"2021":50.8186,"2022":58.1142,"2023":510.0}',
    ch4EmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":520.0}',
    n2oEmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":53.0}',
    combinedEmissionsFactor: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
] as unknown as AfiAnalysisByListId[];

export const ghgAnalysesDataIncompleteRow = [
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 2',
    totalAreaHa: 1256.1646821446757,
    statusCode: 2,
    locationError: null,
    commodity: 'SOYB',
    co2EmissionsFactor: '{"2021":50.8186,"2022":58.1142,"2023":510.0}',
    ch4EmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":520.0}',
    n2oEmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":53.0}',
    combinedEmissionsFactor: '{"2021":120.8186,"2022":228.1142,"2023":0.0}',
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 3',
    totalAreaHa: 1256.4203696590005,
    statusCode: 2,
    co2EmissionsFactor: '{"2021":50.8186,"2022":58.1142,"2023":510.0}',
    ch4EmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":53.0}',
    n2oEmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":520.0}',
    locationError: null,
  },
  {
    listId: 5642,
    listName: 'kgTestCG3 927 all',
    locationName: 'location name 1',
    totalAreaHa: 1256.217339121448,
    statusCode: 2,
    locationError: null,
    commodity: 'SOYB',
    co2EmissionsFactor: '{"2021":50.8186,"2022":58.1142,"2023":510.0}',
    ch4EmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":53.0}',
    n2oEmissionsFactor: '{"2021":520.8186,"2022":528.1142,"2023":520.0}',
    combinedEmissionsFactor: '{"2021":148.3792,"2022":243.5327,"2023":0.0}',
  },
] as unknown as AfiAnalysisByListId[];
