const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const OGIM_DOI = 'https://doi.org/10.5281/zenodo.7466757';
const ESSD_DOI = 'https://doi.org/10.5194/essd-15-3761-2023';

const RAW = `
1|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|O&G Wells|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st37
2|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|O&G Wells|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st37
3|Petrinex (AB Facility Infrastructure Dataset)|2025|Canada|Alberta|2025-02-03|O&G Wells, Compressor Stations, Gathering and Processing, Refineries, Petroleum Terminals, Injection and Disposal|https://www.petrinex.ca/PD/Pages/APD.aspx
4|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Compressor Stations, Gathering and Processing, Refineries, Petroleum Terminals, Injection and Disposal|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st102
5|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Gathering and Processing|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st50
6|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Gathering and Processing|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st50
7|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Gathering and Processing|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st13
8|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Gathering and Processing|https://www.aer.ca/providing-information/data-and-reports/statistical-reports/st13
9|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|Compressor Stations, Equipment and Components, Stations (Other)|https://www1.aer.ca/ProductCatalogue/557.html
10|Natural Resources Canada|2019|Canada|Alberta|2025-02-02|Equipment and Components|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
11|Government of Alberta|2023|Canada|Alberta|2025-02-03|O&G Pipelines|https://geodiscover.alberta.ca/geoportal/rest/metadata/item/4f5d7174ebd34999afec825b9bd3302e/html
12|North Sea Transition Authority|2025|United Kingdom|National|2025-02-02|O&G Wells|https://opendata-nstauthority.hub.arcgis.com/datasets/NSTAUTHORITY::nsta-wells-wgs84/about?layer=0
13|North Sea Transition Authority|2025|United Kingdom|National|2025-02-02|O&G Wells|https://opendata-nstauthority.hub.arcgis.com/datasets/NSTAUTHORITY::onshore-wells-bng/about
14|Norwegian Offshore Directorate|2025|Norway|National|2025-02-03|O&G Wells|https://www.sodir.no/en/about-us/open-data/
15|Netherlands Oil and Gas Portal|2025|Netherlands|National|2025-02-04|O&G Wells|https://www.nlog.nl/datacenter/brhoverview
16|Ministero della Transizione Ecologica|2024|Italy|National|2024-12-30|O&G Wells|https://unmig.mase.gov.it/stoccaggio-del-gas-naturale/
17|Ministero della Transizione Ecologica|2024|Italy|National|2024-12-30|O&G Wells|https://unmig.mase.gov.it/ricerca-e-coltivazione-di-idrocarburi/pozzi-produttivi/
20|Danish Energy Agency|2024|Denmark|National|2024-11-05|O&G Wells|https://ens.dk/en/our-services/oil-and-gas-related-data/drilling-activities
21|Danish Energy Agency|2019|Denmark|National|2024-11-05|O&G Wells|https://ens.dk/en/our-services/oil-and-gas-related-data/drilling-activities
22|Oil and Gas Infrastructure Website|2014|Various|Various|2021-11-01|O&G Wells, Offshore Platforms, Compressor Stations, Gathering and Processing, Refineries, Petroleum Terminals, LNG Facility, Injection and Disposal, O&G Pipelines, O&G Fields, O&G License Blocks|https://sites.google.com/site/oilandgasinfrastructure/
25|British Columbia Energy Regulator|2025|Canada|British Columbia|2025-02-02|O&G Wells|https://data-bcer.opendata.arcgis.com/datasets/657b609ee3314adf91da5ab86d42cda7_0/explore
26|British Columbia Energy Regulator|2025|Canada|British Columbia|2025-02-02|Compressor Stations, Gathering and Processing, Petroleum Terminals, LNG Facility, Injection and Disposal, Tank Batteries, Equipment and Components, Stations (Other)|https://data-bcer.opendata.arcgis.com/datasets/5ace26f614b9435492d679d766430143_0/explore
27|British Columbia Energy Regulator|2025|Canada|British Columbia|2025-02-02|Gathering and Processing|https://www.bc-er.ca/data-reports/data-centre/
29|British Columbia Energy Regulator|2025|Canada|British Columbia|2025-02-02|Equipment and Components|https://data-bcer.opendata.arcgis.com/datasets/1ebbcb291126498fb91583203ea23822_0/explore
30|Norwegian Offshore Directorate|2025|Norway|National|2025-02-03|O&G Fields|https://www.sodir.no/en/about-us/open-data/
31|Natural Resources Canada|2019|Canada|British Columbia|2025-02-02|O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
32|Natural Resources Canada|2019|Canada|British Columbia|2025-02-02|Refineries, O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
33|British Columbia Energy Regulator|2025|Canada|British Columbia|2025-02-02|O&G Pipelines|https://data-bcer.opendata.arcgis.com/datasets/359b7e14fafa4abc84ff873bc55015fb_0/explore
34|Netherlands Oil and Gas Portal|2025|Netherlands|National|2025-02-04|O&G Fields|https://www.nlog.nl/bestanden-interactieve-kaart
35|British Columbia Energy Regulator|2023|Canada|British Columbia|2025-01-08|O&G Fields|https://data-bcer.opendata.arcgis.com/datasets/6757a215a11a456ab1331ddaa4b9bfd1_0/explore
36|Ministero della Transizione Ecologica|2025|Italy|National|2025-02-04|O&G License Blocks|https://www.arcgis.com/home/webmap/viewer.html?webmap=30c7bd2018ea4eac96a24df3e6097c56
37|Ministero della Transizione Ecologica|2024|Italy|National|2025-01-08|Offshore Platforms|https://unmig.mase.gov.it/ricerca-e-coltivazione-di-idrocarburi/piattaforme-marine/
39|Saskatchewan Mining and Petroleum Atlas|2025|Canada|Saskatchewan|2025-02-03|O&G Wells|https://geohub.saskatchewan.ca/datasets/saskatchewan::vertical-wells-1/about
40|Government of Saskatchewan|2022|Canada|Saskatchewan|2022-12-01|Cadastral information|https://gis.saskatchewan.ca/arcgis/rest/services/CadastreLegalSubdivision/MapServer
41|Government of Saskatchewan|2025|Canada|Saskatchewan|2025-02-03|Compressor Stations, Gathering and Processing, Petroleum Terminals, Injection and Disposal, Tank Batteries|https://www.saskatchewan.ca/business/agriculture-natural-resources-and-industry/oil-and-gas/oil-and-gas-news-and-bulletins/well-and-facility-bulletins-data-files-and-drilling-activity-report#facility-reports
42|Government of Saskatchewan|2025|Canada|Saskatchewan|2025-02-03|Compressor Stations, Gathering and Processing, Petroleum Terminals, Injection and Disposal, Tank Batteries|https://www.saskatchewan.ca/business/agriculture-natural-resources-and-industry/oil-and-gas/oil-and-gas-news-and-bulletins/well-and-facility-bulletins-data-files-and-drilling-activity-report#facility-reports
43|Government of Saskatchewan|2025|Canada|Saskatchewan|2025-02-03|Compressor Stations, Gathering and Processing, Petroleum Terminals, Injection and Disposal, Tank Batteries|https://www.saskatchewan.ca/business/agriculture-natural-resources-and-industry/oil-and-gas/oil-and-gas-news-and-bulletins/well-and-facility-bulletins-data-files-and-drilling-activity-report#facility-bulletin
44|Natural Resources Canada|2019|Canada|Saskatchewan|2025-02-02|Equipment and Components|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
45|Natural Resources Canada|2019|Canada|Saskatchewan|2025-02-02|Refineries|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
46|Saskatchewan Mining and Petroleum Atlas|2025|Canada|Saskatchewan|2025-02-04|O&G Pipelines|https://geohub.saskatchewan.ca/maps/pipelines-and-flowlines/about
47|Saskatchewan Mining and Petroleum Atlas|2025|Canada|Saskatchewan|2025-02-04|O&G Fields|https://geohub.saskatchewan.ca/datasets/saskatchewan::oil-and-gas-pools-/about
50|Government of Manitoba|2025|Canada|Manitoba|2025-02-03|O&G Wells|https://www.gov.mb.ca/iem/petroleum/gis/
51|Danish Energy Agency|2024|Denmark|National|2024-11-05|O&G Fields|https://ens.dk/en/our-services/oil-and-gas-related-data/shape-files-maps
52|Petrinex (Manitoba)|2025|Canada|Manitoba|2025-02-03|Gathering and Processing, Petroleum Terminals, Injection and Disposal, Tank Batteries|https://www.petrinex.ca/PD/Pages/MBPD.aspx
53|Natural Resources Canada|2019|Canada|Manitoba|2025-02-02|Equipment and Components, O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
54|Natural Resources Canada|2019|Canada|Manitoba|2025-02-02|O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
55|Government of Manitoba|2024|Canada|Manitoba|2025-01-08|O&G Fields|https://www.gov.mb.ca/iem/petroleum/gis/
58|Government of Ontario|2025|Canada|Ontario|2025-02-02|O&G Wells|https://geohub.lio.gov.on.ca/datasets/lio::petroleum-well/about
59|Government of Ontario|2014|Canada|Ontario|2025-01-08|Tank Batteries|https://www.arcgis.com/home/item.html?id=f09b7a821d0c4701b79ac3bdbfd691eb
60|Government of Ontario|2011|Canada|Ontario|2025-01-08|O&G Fields|https://geohub.lio.gov.on.ca/datasets/lio::petroleum-historical-oilfield/about
61|Natural Resources Canada|2019|Canada|Ontario|2025-02-02|Equipment and Components, O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
62|Natural Resources Canada|2019|Canada|Ontario|2025-02-02|Refineries, O&G Pipelines|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
63|Natural Resources Canada|2019|Canada|Quebec|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
65|Natural Resources Canada|2019|Canada|Newfoundland and Labrador|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
67|Natural Resources Canada|2019|Canada|New Brunswick|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
69|Natural Resources Canada|2019|Canada|Nova Scotia|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
71|Natural Resources Canada|2019|Canada|Northwest Territories|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
73|Natural Resources Canada|2019|Canada|Nunavut|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
75|Natural Resources Canada|2019|Canada|Prince Edward Island|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
77|Natural Resources Canada|2019|Canada|Yukon|2025-02-02|O&G Wells|https://open.canada.ca/data/en/dataset/8ba2aa2a-7bb9-4448-b4d7-f164409fe056
81|Danish Energy Agency|2023|Denmark|National|2024-11-05|Offshore Platforms|https://ens.dk/en/our-services/oil-and-gas-related-data/shape-files-maps
84|Ministero della Transizione Ecologica|2024|Italy|National|2025-01-09|Petroleum Terminals|https://unmig.mase.gov.it/stoccaggio-del-gas-naturale/
87|Homeland Infrastructure Foundation-Level Data|2022|United States|National|2024-08-14|Compressor Stations|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::natural-gas-compressor-stations/about
88|Norwegian Offshore Directorate|2025|Norway|National|2025-02-03|O&G License Blocks|https://www.sodir.no/en/about-us/open-data/
90|Marchese et al.|2015|United States|National|2025-02-04|Compressor Stations|https://pubs.acs.org/doi/abs/10.1021/acs.est.5b02275
91|Homeland Infrastructure Foundation-Level Data|2017|United States|National|2024-02-04|Gathering and Processing|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::natural-gas-processing-plants-1/about
93|Homeland Infrastructure Foundation-Level Data|2021|United States|National|2024-02-04|Petroleum Terminals|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::pol-terminals-1/about
94|Homeland Infrastructure Foundation-Level Data|2021|United States|National|2024-08-14|Stations (Other)|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::pol-pumpingstations/about
95|Homeland Infrastructure Foundation-Level Data|2020|United States|National|2025-02-02|O&G Pipelines|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::hydrocarbon-gas-liquid-pipelines-1/about
96|Homeland Infrastructure Foundation-Level Data|2020|United States|National|2025-02-02|O&G Pipelines|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::natural-gas-interstate-and-intrastate-pipelines/about
98|U.S. Energy Information Administration|2024|United States|National|2025-01-08|O&G Basins|https://atlas.eia.gov/datasets/eia::sedimentary-basins-1/about
99|U.S. Energy Information Administration|2021|United States|National|2025-01-08|O&G Fields|https://atlas.eia.gov/datasets/eia::tight-oil-and-shale-gas-plays/about
100|U.S. Energy Information Administration|2022|United States|National|2025-01-08|Injection and Disposal|https://atlas.eia.gov/datasets/eia::natural-gas-underground-storage-1/about
104|Government of South Australia, Department for Energy and Mining|2025|Australia|South Australia|2025-02-05|O&G Wells|https://catalog.sarig.sa.gov.au/geonetwork/srv/eng/catalog.search#/metadata/f3611b16-80fa-45c0-8801-d30c63aa0278
105|Argentina Secretary of Energy|2025|Argentina|National|2025-02-04|O&G Wells|http://datos.energia.gob.ar/dataset/c846e79c-026c-4040-897f-1ad3543b407c/archivo/3fcda0c5-68aa-4f33-bbe2-0180e6dbeebe
107|Government of Western Australia, Dept. of Mines, Industry Regulation and Safety|2025|Australia|Western Australia|2025-02-05|O&G Wells|https://dasc.dmirs.wa.gov.au/
108|National Offshore Petroleum Titles Administrator|2025|Australia|National|2025-02-05|O&G Wells|https://www.nopta.gov.au/maps-and-public-data/spatial-data.html
109|Argentina Secretaría de Energía|2023|Argentina|National|2025-02-04|Gathering and Processing|http://datos.energia.gob.ar/dataset/164e7197-3222-4d21-81df-9db30ccd3940
110|Argentina Secretaría de Energía|2025|Argentina|National|2025-02-04|Gathering and Processing|http://datos.energia.gob.ar/dataset/e5c525ff-6dbd-4e1e-a52e-14e9d742c4f1/archivo/9029e1ae-77f2-4aee-8e40-c30943ac9d1b
112|Argentina Secretaría de Energía|2024|Argentina|National|2025-02-04|Petroleum Terminals|http://datos.energia.gob.ar/dataset/99ba34a0-08f2-48e3-8d37-4d92542f740e
113|Argentina Secretaría de Energía|2025|Argentina|National|2025-02-04|Refineries|http://datos.energia.gob.ar/dataset/a9eed347-78ab-45c0-a489-b227fe42ee1b/archivo/4399cb2d-c221-4b9a-9799-8fc008cefd77
115|Argentina Secretaría de Energía|2025|Argentina|National|2025-02-04|O&G Pipelines|http://datos.energia.gob.ar/dataset/84681f81-dbbb-49eb-be30-e61778736ad9/archivo/17fcc6b7-9d9c-4005-a93a-1b2d3a7b1ce5
116|Argentina Secretaría de Energía|2023|Argentina|National|2025-02-04|O&G Pipelines|http://datos.energia.gob.ar/dataset/8758101a-1e0d-413f-8cc5-83e21ece6391
121|GeoBolivia|2024|Bolivia|National|2025-02-04|O&G Wells|https://geo.gob.bo/catalogue/#/dataset/1732
122|GeoBolivia|2024|Bolivia|National|2025-02-04|Gathering and Processing|https://geo.gob.bo/catalogue/#/dataset/1636
123|GeoBolivia|2013|Bolivia|National|2025-02-04|Compressor Stations, Stations (Other)|https://geo.gob.bo/catalogue/#/dataset/915
124|GeoBolivia|2016|Bolivia|National|2025-02-04|O&G Pipelines|https://geo.gob.bo/catalogue/#/dataset/788
125|GeoBolivia|2017|Bolivia|National|2022-11-22|O&G Fields|https://geo.gob.bo/catalogue/#/dataset/272
126|Brazil National Agency of Petroleum, Natural Gas and Hydrocarbons|2025|Brazil|National|2025-02-04|O&G Wells, Refineries, Petroleum Terminals|https://geomaps.anp.gov.br/
130|Princeton University Library|2006|Colombia|National|2022-02-10|Refineries|https://maps.princeton.edu/catalog/tufts-colombiarefinery06
131|ArcGIS Online|2021|Venezuela|National|2022-05-12|O&G Wells|https://services6.arcgis.com/lpJCO3ug8HhNiEOV/arcgis/rest/services/Pozos_Petroleros/FeatureServer
132|ArcGIS Online|2017|Venezuela|National|2025-01-08|Compressor Stations, Gathering and Processing, Refineries, Stations (Other), O&G Pipelines, O&G License Blocks|https://www.arcgis.com/home/item.html?id=dbf1980828644d60ac3fee3bcf9fdbc5
133|Perupetro|2022|Peru|National|2024-11-13|O&G Wells, O&G License Blocks|https://perupetro.maps.arcgis.com/apps/webappviewer/index.html?id=6a830a470b934f0687c8ed84c2baccc
134|Geologia del Paraguay|2016|Paraguay|National|2025-01-10|O&G Wells, O&G License Blocks|https://www.geologiadelparaguay.com.py/Mapas.htm
135|National Offshore Petroleum Titles Administrator|2025|Australia|National|2025-02-05|O&G License Blocks|https://www.nopta.gov.au/maps-and-public-data/spatial-data.html
136|Newfoundland and Labrador Offshore Petroleum Board|2025|Canada|Newfoundland and Labrador|2025-01-08|O&G Wells|https://home-cnlopb.hub.arcgis.com/datasets/28cac5ccdace47819a69e897c79ae729/about
137|Newfoundland and Labrador Offshore Petroleum Board|2024|Canada|Newfoundland and Labrador|2025-01-08|O&G Wells|https://home-cnlopb.hub.arcgis.com/datasets/d4174b3353b3436fa7b7d182aaf656f5/about
138|Newfoundland and Labrador Offshore Petroleum Board|2022|Canada|Newfoundland and Labrador|2025-01-08|O&G Wells|https://home-cnlopb.hub.arcgis.com/datasets/04d2b5254f894984a59fe322abe98d65/about
139|Newfoundland and Labrador Offshore Petroleum Board|2024|Canada|Newfoundland and Labrador|2025-01-08|O&G Wells|https://home-cnlopb.hub.arcgis.com/datasets/6ff2b3c3d4924497bde5d25e7df6fcc9/about
140|Newfoundland and Labrador Offshore Petroleum Board|2024|Canada|Newfoundland and Labrador|2025-01-08|O&G License Blocks|https://home-cnlopb.hub.arcgis.com/datasets/b1f536a6a7554608aec2810c95821ccc/about
141|Newfoundland and Labrador Offshore Petroleum Board|2024|Canada|Newfoundland and Labrador|2025-01-08|O&G License Blocks|https://home-cnlopb.hub.arcgis.com/datasets/5d563b7108fc41d2add34170ea36edd4/about
142|Earth Observation Group|2023|Various|Various|2024-01-16|Natural Gas Flaring Detections|https://eogdata.mines.edu/products/vnf/global_gas_flare.html
143|U.S. Energy Information Administration|2005|United States|National|2025-01-08|O&G Fields|https://www.eia.gov/maps/maps.htm
144|U.S. Energy Information Administration|2005|United States|National|2025-01-08|O&G Fields|https://www.eia.gov/maps/maps.htm
145|U.S. Energy Information Administration|2005|United States|National|2025-01-08|O&G Fields|https://www.eia.gov/maps/maps.htm
147|Homeland Infrastructure Foundation-Level Data|2017|Various|Various|2024-02-02|O&G Basins|https://hifld-geoplatform.hub.arcgis.com/datasets/oil-and-natural-gas-fields/explore
148|New Zealand Petroleum & Minerals|2024|New Zealand|National|2025-01-08|O&G License Blocks|https://data.nzpam.govt.nz/permitwebmaps/?commodity=petroleum
157|Integrated Petroleum Affairs System|2024|Ireland|National|2025-01-10|O&G Wells|https://www.arcgis.com/home/item.html?id=add3a15940154f4290a34dda9a97e8ec
158|U.S. Geological Survey|2021|Various|Various|2025-02-04|Petroleum Terminals, LNG Facility, O&G Pipelines|https://www.sciencebase.gov/catalog/item/607611a9d34e018b3201cbbf
163|U.S. Geological Survey|2006|Afghanistan|National|2025-02-03|O&G Fields|https://www.sciencebase.gov/catalog/item/60a816ced34ea221ce4e5b2b
165|Nigerian Oil Spill Detection and Response Agency|2019|Nigeria|National|2022-12-09|O&G Wells|https://oilspillmonitor.ng/
166|ArcGIS Online|2017|Libya|National|2025-01-09|Gathering and Processing, Refineries, LNG Facility, Tank Batteries, O&G Pipelines, O&G Fields|https://www.arcgis.com/home/item.html?id=0e5b084c9e964fdb9d0e6992f296fb2e
168|Ghazanfar Group|2024|Afghanistan|Sub-national|2025-01-09|Refineries, Petroleum Terminals|https://www.ghazanfargroup.com/refinery.php?lang=en
170|Imam Khomeini Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.ikorc.ir/
171|Tehran Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.torc.ir/
172|Esfahan Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.eorc.ir/
173|Tabriz Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.tbzrefinery.co.ir/
174|Shiraz Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://sorc.ir/aboutus/
175|Lavan Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|http://www.lorc.ir/
176|Persian Gulf Star Oil Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://pgsoc.ir/
177|Bandar Abbas Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.baorco.ir/
178|Kermanshah Oil Refining Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://korc.ir/faIR/DouranPortal/1/page/%D8%B5%D9%81%D8%AD%D9%87-%D8%A7%D8%B5%D9%84%DB%8C
179|Pars Oil Company|2022|Iran|Sub-national|2022-07-05|Refineries|https://www.parsoilco.com/
181|GIS Lab User Forum|2016|Russia|National|2025-01-09|O&G Fields|https://gis-lab.info/forum/viewtopic.php?t=21352
185|State of Alabama Oil and Gas Board|2025|United States|Alabama|2025-02-02|O&G Wells|https://www.gsa.state.al.us/ogb/gisdata
186|Alaska Oil and Gas Conservation Commission|2025|United States|Alaska|2025-02-02|O&G Wells|https://www.commerce.alaska.gov/web/aogcc/Data.aspx
187|Arkansas GIS Office - Arkansas Oil and Gas Commission|2024|United States|Arkansas|2025-02-02|O&G Wells|https://gis.arkansas.gov/product/arkansas-oil-and-gas-wells/
188|CalGEM GIS Mapping|2025|United States|California|2025-02-02|O&G Wells|https://gis.conservation.ca.gov/portal/home/item.html?id=335e036c6a4f4cc39148ca2a9e0389c7
189|Colorado Oil and Gas Conservation Commission|2025|United States|Colorado|2025-02-02|O&G Wells|https://ecmc.state.co.us/data2.html#/downloads
191|Indiana Department of Natural Resources, Division of Oil and Gas|2023|United States|Indiana|2025-02-03|O&G Wells|https://experience.arcgis.com/experience/a4156fca53524f24a6150b58fdf0402f
192|Kansas Geological Survey, University of Kansas|2025|United States|Kansas|2025-02-03|O&G Wells|https://www.kgs.ku.edu/PRS/petroDB.html
193|Kentucky Geological Survey, University of Kentucky|2024|United States|Kentucky|2025-02-02|O&G Wells|https://www.uky.edu/KGS/emsweb/data/kyogshape.html
194|Louisiana Department of Natural Resources|2025|United States|Louisiana|2025-02-04|O&G Wells|https://sonlite.dnr.state.la.us/ords/f?p=108:2
195|Michigan Department of Environment, Great Lakes, and Energy|2025|United States|Michigan|2025-02-04|O&G Wells|https://gis-egle.hub.arcgis.com/datasets/egle::oil-gas-test-well-surface-hole-locations/about
196|Colorado Oil and Gas Infrastructure System|2025|United States|Colorado|2025-02-02|Tank Batteries|https://ecmc.state.co.us/data2.html#/downloads
197|Texas Railroad Commission|2025|United States|Texas|2025-02-02|O&G Pipelines|https://www.rrc.texas.gov/resource-center/research/data-sets-available-for-download/
198|CGG Robertson Sedimentary Basins of the World|2019|Various|Various|2024-03-02|O&G Basins|https://hub.arcgis.com/datasets/9845f1f30a1641efbe54dd1f9c8c668b/about
203|U.S. Energy Information Administration|2017|United States|National|2024-08-14|O&G Basins|https://www.eia.gov/maps
204|Wüst and Cui|2018|Canada|National|2025-02-03|O&G Basins|https://csegrecorder.com/articles/view/x-ray-fluorescence-xrf-to-mechanical-profiling-for-better-well-completion
205|Soubotcheva and Stewart|2006|Canada|National|2025-02-03|O&G Basins|https://csegrecorder.com/articles/view/predicting-lithology-and-porosity-at-the-pikes-peak-heavy-oilfield-saskatchewan
206|Atlas of the Western Canada Sedimentary Basin|1994|Canada|National|2025-02-02|O&G Basins|https://ags.aer.ca/reports/atlas-western-canada-sedimentary-basin
207|Mississippi State Oil & Gas Board|2025|United States|Mississippi|2025-02-04|O&G Wells|https://www.ogb.state.ms.us/downloads.php
209|Montana Board of Oil and Gas Conservation|2025|United States|Montana|2025-02-04|O&G Wells|https://bogwebfiles.dnrc.mt.gov/GISData/
210|New Mexico Energy, Minerals and Natural Resources Department|2025|United States|New Mexico|2025-02-02|O&G Wells|https://ocd-hub-nmemnrd.hub.arcgis.com/datasets/dd971b8e25c54d1a8ab7c549244cf3cc_0/about
211|New York Department of Environmental Conservation|2025|United States|New York|2025-02-02|O&G Wells|https://dec.ny.gov/environmental-protection/oil-gas/data-and-geographic-information-oil-gas-other-wells/downloadable-data/documentation
212|North Dakota Mineral Resources|2025|United States|North Dakota|2025-02-02|O&G Wells|https://gis.dmr.nd.gov/gisdownload.asp
213|Ohio Department of Natural Resources|2025|United States|Ohio|2025-02-02|O&G Wells, O&G Production|https://ohiodnr.gov/discover-and-learn/safety-conservation/about-odnr/oil-gas/oil-gas-resources/featured-content-3
215|Pennsylvania Department of Environmental Protection|2023|United States|Pennsylvania|2025-02-04|O&G Wells, O&G Production|https://greenport.pa.gov/ReportExtracts/OG/OilGasWellProdReport
216|Tennessee Department of Environment and Conservation|2025|United States|Tennessee|2025-02-02|O&G Wells|https://dataviewers.tdec.tn.gov/dataviewers/r/tdec_reports/f11776/oil-and-gas-well-permits
217|Texas Railroad Commission|2025|United States|Texas|2025-02-02|O&G Wells|https://www.rrc.texas.gov/resource-center/research/data-sets-available-for-download/
218|Utah Division of Oil, Gas and Mining|2025|United States|Utah|2025-02-02|O&G Wells|https://gis.utah.gov/products/sgid/energy/oil-gas-wells/
219|West Virginia Department of Environmental Protection|2025|United States|West Virginia|2025-02-05|O&G Wells|https://tagis.dep.wv.gov/wvdep_gis_viewer/
220|Wyoming Oil and Gas Conservation Commission|2025|United States|Wyoming|2025-02-04|O&G Wells|http://pipeline.wyo.gov/rnewuserspage.html
222|Alberta Energy Regulator|2025|Canada|Alberta|2025-02-03|O&G Pipelines|https://www1.aer.ca/ProductCatalogue/557.html
223|Comisión Nacional de Hidrocarburos|2025|Mexico|National|2025-02-02|O&G Wells|https://mapa.hidrocarburos.gob.mx/?lng=en_US
224|Comisión Nacional de Hidrocarburos|2021|Mexico|National|2025-02-02|Refineries|https://mapa.hidrocarburos.gob.mx/?lng=en_US
225|Comisión Nacional de Hidrocarburos|2022|Mexico|National|2025-02-02|Offshore Platforms, Compressor Stations, Gathering and Processing, Petroleum Terminals, Tank Batteries, Equipment and Components, Stations (Other)|https://mapa.hidrocarburos.gob.mx/?lng=en_US
226|Comisión Nacional de Hidrocarburos|2021|Mexico|National|2025-02-02|Gathering and Processing|https://mapa.hidrocarburos.gob.mx/?lng=en_US
227|Comisión Nacional de Hidrocarburos|2018|Mexico|National|2025-02-02|Petroleum Terminals|https://mapa.hidrocarburos.gob.mx/?lng=en_US
228|Comisión Nacional de Hidrocarburos|2025|Mexico|National|2025-02-02|O&G Pipelines|https://mapa.hidrocarburos.gob.mx/?lng=en_US
229|Comisión Nacional de Hidrocarburos|2021|Mexico|National|2025-02-02|O&G Pipelines|https://mapa.hidrocarburos.gob.mx/?lng=en_US
230|Comisión Nacional de Hidrocarburos|2021|Mexico|National|2025-02-02|O&G Pipelines|https://mapa.hidrocarburos.gob.mx/?lng=en_US
231|Comisión Nacional de Hidrocarburos|2021|Mexico|National|2025-02-02|O&G Pipelines|https://mapa.hidrocarburos.gob.mx/?lng=en_US
232|Comisión Nacional de Hidrocarburos|2024|Mexico|National|2025-02-02|O&G Fields|https://mapa.hidrocarburos.gob.mx/?lng=en_US
233|Comisión Nacional de Hidrocarburos|2024|Mexico|National|2025-02-02|O&G Fields|https://mapa.hidrocarburos.gob.mx/?lng=en_US
235|Ministero della Transizione Ecologica|2024|Italy|National|2025-01-09|Gathering and Processing|https://unmig.mase.gov.it/ricerca-e-coltivazione-di-idrocarburi/centrali-di-raccolta-e-trattamento/
236|Danish Energy Agency|2023|Denmark|National|2024-11-05|O&G License Blocks|https://ens.dk/en/our-services/oil-and-gas-related-data/shape-files-maps
237|Argentina Secretaría de Energía|2023|Argentina|National|2025-02-04|Compressor Stations|http://datos.energia.gob.ar/dataset/8758101a-1e0d-413f-8cc5-83e21ece6391
238|Argentina Secretaría de Energía|2023|Argentina|National|2025-02-04|Compressor Stations|http://datos.energia.gob.ar/dataset/8758101a-1e0d-413f-8cc5-83e21ece6391
239|Global Energy Monitor|2024|Various|Various|2025-01-14|LNG Facility|https://globalenergymonitor.org/projects/global-gas-infrastructure-tracker/
240|Geological Survey of Queensland, Department of Resources|2025|Australia|Queensland|2025-02-05|O&G Wells|https://qldspatial.information.qld.gov.au/catalogue/custom/detail.page?fid={9ED7F9ED-456A-4D87-AD30-69231A6F5811}
241|Geological Survey of Queensland, Department of Resources|2024|Australia|Queensland|2025-02-05|O&G Pipelines|https://qldspatial.information.qld.gov.au/catalogue/custom/detail.page?fid={A36B4591-EE8F-46CF-A23E-0397A1F9A1A4}
242|Chen et al.|2024|China|National|2025-02-03|Tank Batteries|https://zenodo.org/records/10514151
244|Homeland Infrastructure Foundation-Level Data|2022|United States|National|2024-02-04|Tank Batteries|https://hifld-geoplatform.hub.arcgis.com/datasets/geoplatform::above-ground-lng-storage-facilities/about
245|Missouri Department of Natural Resources|2024|United States|Missouri|2025-02-02|O&G Wells|https://dnr.mo.gov/land-geology/businesses-landowners-permittees/permits/oil-gas
259|Oklahoma Corporation Commission|2025|United States|Oklahoma|2025-02-02|O&G Wells|https://oklahoma.gov/occ/divisions/oil-gas/oil-gas-data.html
261|ArcGIS Online|2017|Venezuela|-|2025-02-04|O&G Pipelines|https://www.arcgis.com/home/item.html?id=a103734e9d844d51bf67285a03c18979
263|Netherlands Oil and Gas Portal|2025|Netherlands|National|2025-02-04|Offshore Platforms|https://www.nlog.nl/bestanden-interactieve-kaart
264|North Sea Transition Authority|2025|United Kingdom|National|2025-02-02|O&G Fields|https://opendata-nstauthority.hub.arcgis.com/datasets/6b3b3a92900c462abd365105adfc7a37_0/about
265|North Sea Transition Authority|2024|United Kingdom|National|2025-02-02|Offshore Platforms|https://opendata-nstauthority.hub.arcgis.com/datasets/NSTAUTHORITY::nsta-offshore-infrastructure-wgs84/about?layer=0
266|Bureau of Ocean Energy Management|2025|United States|National|2025-02-04|Offshore Platforms|https://www.data.boem.gov/Main/Platform.aspx#ascii
267|Empresa de Pesquisa Energética|2024|Brazil|National|2025-02-04|Compressor Stations, Gathering and Processing, Refineries, Petroleum Terminals, LNG Facility, Stations (Other), O&G Pipelines, O&G Basins|https://gisepeprd2.epe.gov.br/WebMapEPE-en/
268|Landesamt für Bergbau, Energie und Geologie|2024|Germany|Lower Saxony|2025-01-06|O&G Wells|https://nibis.lbeg.de/cardoMap3/?th=BOHRKW
269|U.S. Energy Information Administration|2024|United States|National|2025-01-14|Refineries|https://atlas.eia.gov/datasets/eia::petroleum-refineries-1/about
270|Colombian Geological Service (SGC)|2022|Colombia|National|2025-02-04|O&G Wells|https://datos.sgc.gov.co/datasets/55f871d861624b9996e865349ef67253_0/about
271|South Dakota Geological Survey and South Dakota Department of Agriculture and Natural Resources|2025|United States|South Dakota|2025-02-10|O&G Wells, O&G Production|https://www.sdgs.usd.edu/sdoil/oilgas_databases.aspx
272|Nebraska Oil and Gas Conservation Commission|2025|United States|Nebraska|2025-02-10|O&G Wells|http://www.nogcc.ne.gov/data-publications/
300|The Authors (Environmental Defense Fund)|2024|Various|Various|2025-01-08|O&G Basins|
`.trim();

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const rows = RAW.split('\n').map(line => {
    const [id, name, year, country, region, visit, types, url = ''] = line.split('|');
    const link = url
        ? `<a href="${esc(url)}" rel="noopener" target="_blank">${esc(url)}</a>`
        : '—';
    return `<tr><td>${id}</td><td>${esc(name)}</td><td>${year}</td><td>${esc(country)}</td><td>${esc(region)}</td><td>${visit}</td><td>${esc(types.replaceAll('O&G', 'Oil & Gas'))}</td><td class="src">${link}</td></tr>`;
});

const countries = [...new Set(RAW.split('\n').map(l => l.split('|')[3]))].sort();
const sourceCount = rows.length;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link rel="icon" type="image/png" href="/img/oilmap.png" sizes="16x16">
    <title>Data Lineage and Sources | World Oil Map</title>
    <meta name="description" content="Data lineage for World Oil Map: ${sourceCount} official government, regulator and research sources for oil and gas wells, pipelines, refineries and infrastructure, derived from OGIM v2.7.">
    <link rel="canonical" href="https://oilmap.xyz/data_lineage.html">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Data Lineage and Sources | World Oil Map">
    <meta property="og:description" content="Official sources behind World Oil Map, referenced from the OGIM v2.7 database.">
    <meta property="og:url" content="https://oilmap.xyz/data_lineage.html">
    <meta property="og:image" content="https://oilmap.xyz/img/preview.jpg">
    <meta name="twitter:card" content="summary_large_image">
    <script type="application/ld+json">
    {
        "@context": "https://schema.org",
        "@type": "Dataset",
        "name": "World Oil Map data lineage: OGIM v2.7 source references",
        "description": "Source references for oil and gas infrastructure data used by World Oil Map, including wells, pipelines, refineries, compressor stations, LNG facilities and license blocks.",
        "url": "https://oilmap.xyz/data_lineage.html",
        "creator": { "@type": "Person", "name": "Roque Leal" },
        "isBasedOn": { "@type": "Dataset", "name": "Oil and Gas Infrastructure Mapping (OGIM) Database v2.7", "identifier": "${OGIM_DOI}", "url": "${OGIM_DOI}" },
        "citation": "${ESSD_DOI}",
        "license": "https://www.gnu.org/licenses/gpl-3.0.html",
        "spatialCoverage": "Global"
    }
    </script>
    <style>
        :root { --bg-body: #0f172a; --bg-card: #1e293b; --bg-header: #020617; --border: #334155; --text: #f1f5f9; --muted: #94a3b8; --accent: #10b981; --accent-hover: #34d399; --gold: #f0b823; }
        * { box-sizing: border-box; }
        body { font-family: 'Inter', system-ui, sans-serif; background: var(--bg-body); color: var(--text); line-height: 1.65; margin: 0; -webkit-font-smoothing: antialiased; }
        a { color: var(--accent); text-decoration: none; }
        a:hover { color: var(--accent-hover); }
        header.top-bar { position: sticky; top: calc(12px + env(safe-area-inset-top, 0px)); z-index: 100; width: calc(100% - 28px); max-width: 1380px; margin: 14px auto 0; padding: 8px 14px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: rgba(13, 18, 30, .84); border: 1px solid rgba(255, 255, 255, .1); box-shadow: 0 12px 32px -4px rgba(0, 0, 0, .6); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
        .brand { display: flex; align-items: center; gap: 10px; flex-shrink: 0; color: #f8fafc; }
        .brand img { height: 30px; width: 30px; object-fit: contain; }
        .brand-title { font-size: .92rem; font-weight: 700; letter-spacing: .5px; white-space: nowrap; }
        .brand-title span { color: #f0b823; font-weight: 500; }
        .toolbar { display: flex; align-items: center; gap: 6px; overflow-x: auto; scrollbar-width: none; }
        .toolbar::-webkit-scrollbar { display: none; }
        .nav-link { padding: 7px 12px; border-radius: 999px; border: 1px solid transparent; background: rgba(255, 255, 255, .05); color: #f8fafc; font-size: .76rem; font-weight: 500; text-decoration: none; white-space: nowrap; transition: all .18s ease; }
        .nav-link:hover, .nav-link[aria-current="page"] { background: rgba(240, 184, 35, .14); border-color: rgba(240, 184, 35, .35); color: #f0b823; }
        @media (max-width: 600px) { header.top-bar { width: calc(100% - 20px); padding: 6px 10px; } .brand-title { font-size: .8rem; } .nav-link { padding: 6px 9px; font-size: .72rem; } }
        .container { max-width: 1100px; margin: 0 auto; padding: 36px 20px 20px; }
        h1 { font-size: 2rem; line-height: 1.25; margin: 0 0 12px; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
        h2 { color: var(--text); font-size: 1.3rem; margin: 48px 0 10px; }
        .lead { color: var(--muted); max-width: 780px; margin: 0 0 24px; }
        .cite { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 18px; line-height: 1.6; font-size: 0.95em; color: #cbd5e1; }
        .cite p { margin: 0 0 12px; }
        .cite p:last-child { margin-bottom: 0; }
        .table-wrap { overflow-x: auto; margin-top: 24px; background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85em; }
        th, td { text-align: left; padding: 10px 12px; border-bottom: 1px solid var(--border); vertical-align: top; }
        th { color: var(--text); background: rgba(0, 0, 0, 0.2); position: sticky; top: 0; font-weight: 600; }
        td { color: #cbd5e1; }
        td.src { word-break: break-all; }
        .countries { line-height: 1.8; color: var(--muted); font-size: 0.9em; }
        footer { max-width: 1100px; margin: 40px auto 0; padding: 24px 20px 40px; border-top: 1px solid var(--border); color: var(--muted); font-size: 0.9em; }
        @media (max-width: 600px) { h1 { font-size: 1.6rem; } }
    </style>
</head>
<body>
    <header class="top-bar">
        <a class="brand" href="/">
            <img src="/img/oilmap.png" width="30" height="30" alt="" onerror="this.style.display='none'">
            <span class="brand-title">WORLD OIL MAP <span>2026</span></span>
        </a>
        <nav class="toolbar" aria-label="Main">
            <a class="nav-link" href="/">Home</a>
            <a class="nav-link" href="/blog.html">Blog</a>
            <a class="nav-link" href="/cited-by.html">Cited by</a>
            <a class="nav-link" href="/data_lineage.html" aria-current="page">Data lineage</a>
            <a class="nav-link" href="/contact.html">Contact</a>
        </nav>
    </header>
    <div class="container">

        <h1>Data Lineage and Sources</h1>
        <p class="lead">
            World Oil Map relies on official government, regulator and research datasets for oil and gas infrastructure.
            This page lists the source references compiled in the Oil and Gas Infrastructure Mapping (OGIM) database, version 2.7,
            with the country, region, infrastructure types and last visit date recorded for each source.
        </p>

        <h2>How to cite</h2>
        <div class="cite">
            <p><strong>OGIM database, version 2.7:</strong> O’Brien, M.A., Omara, M., Himmelberger, A., Gautam, R. Oil and Gas Infrastructure Mapping (OGIM) Database. <a href="${OGIM_DOI}" target="_blank" rel="noopener">${OGIM_DOI}</a></p>
            <p><strong>OGIM database License:</strong> These datasets are provided under a Creative Commons Attribution 4.0 International Public License, unless otherwise noted.</p>
            <p><strong>Created by:</strong> Omara et al</p>
            <p><strong>Curated in GEE by:</strong> Samapriya Roy</p>
            <p><strong>Keywords:</strong> OGIM dataset, Methane emissions, Environmental Defense Fund (EDF), MethaneSAT, infrastructure types, oil and gas wells, offshore platforms, Compressor stations, Liquefied natural gas facilities, Crude oil refineries</p>
            <p><strong>OGIM data description paper:</strong> Omara, M., Gautam, R., O'Brien, M., Himmelberger, A., Franco, A., Meisenhelder, K., Hauser, G., Lyon, D., Chulakadabba, A., Miller, C., Franklin, J., Wofsy, S., and Hamburg, S.: Developing a spatially explicit global oil and gas infrastructure database for characterizing methane emission sources at high resolution, <em>Earth System Science Data Discussions</em>, <a href="${ESSD_DOI}" target="_blank" rel="noopener">${ESSD_DOI}</a>, 2023.</p>
        </div>

        <h2>Coverage</h2>
        <p class="countries">${sourceCount} source references across ${countries.length} countries and multi-country or global datasets: ${countries.map(esc).join(', ')}.</p>

        <h2>Source references</h2>
        <div class="table-wrap">
            <table>
                <thead>
                    <tr><th>ID</th><th>Source</th><th>Year</th><th>Country</th><th>Region</th><th>Last visit</th><th>Infrastructure types</th><th>Source URL</th></tr>
                </thead>
                <tbody>
                    ${rows.join('\n                    ')}
                </tbody>
            </table>
        </div>

        <footer>
            Source references from OGIM v2.7. For more information about each source, see the Data_Catalog layer of the OGIM GeoPackage.
            © 2026 World Oil Map · Open Data · Open Source
        </footer>
    </div>
</body>
</html>
`;

fs.writeFileSync(path.join(root, 'data_lineage.html'), html);
console.log(`data_lineage.html written, ${rows.length} sources`);
