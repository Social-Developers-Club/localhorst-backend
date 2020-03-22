'use strict';

const { Client } = require('@elastic/elasticsearch');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';
const client = new Client({ node: elasticsearchNode });

const documentsToInsert = [
  {
    'category': ['financial'],
    'description': 'Solo-Selbstständige haben einen Recht auf ALG 2.',
    'imageUrl': 'https://selbststaendige.verdi.de/++file++5e7236aa72b2335f1fea814b/download/coronavirus_FAQ-grau.jpg',
    'industry': ['freelancer'],
    'link': 'https://selbststaendige.verdi.de/beratung/corona-infopool/++co++aa8e1eea-6896-11ea-bfc7-001a4a160100',
    'title': 'Mögliche Entschädigung',
    'type': 'info'
  },
  {
    'category': ['financial'],
    'description': 'Gastronomen haben ein Recht auf Entschädigung, wenn eine amtlich angeordnete Quarantäne vorliegt. Absatz 12 §56 ff fällt meistens unter Unternehmensrisiko.',
    'imageUrl': 'https://images.unsplash.com/photo-1583324113626-70df0f4deaab?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
    'industry': ['restaurants'],
    'link': 'https://www.gesetze-im-internet.de/ifsg/IfSG.pdf',
    'title': 'Mögliche Entschädigung',
    'type': 'info'
  },
  {
    'category': ['financial'],
    'description': 'Als Unternehmen, Selbstständiger oder Freiberufler sind Sie durch die Corona-Krise in finanzielle Schieflage geraten und benötigen einen Kredit?',
    'imageUrl': 'https://www.kfw.de/Presse-Newsroom/Aktuelles/News/Bilder-f%C3%BCr-News/header-corona-finanzhilfe_Responsive_1280x320.jpg',
    'industry': ['retail', 'service', 'restaurants', 'culture'],
    'link': 'https://www.kfw.de/KfW-Konzern/Newsroom/Aktuelles/KfW-Corona-Hilfe-Unternehmen.html',
    'title': 'KfW-Corona-Hilfe: Kredite für Unternehmen',
    'type': 'info',
  },
  {
    'category': ['financial'],
    'description': 'StartNext ist eine Crowdfunding Platform, die während Corona genutzt werden kann, um Kunden eine Möglichkeit zu geben, das eigene geschäft zu unterstützen.',
    'imageUrl': 'https://www.startnext.com/media/thumbnails/ed8/cc7928aa9486385f4e55d08e4c504ed8/122b6345/corona_fonds_headervisual_v1_2x_1584544613.jpg',
    'industry': ['retail', 'service', 'restaurants', 'culture', 'freelancer'],
    'link': 'https://www.startnext.com/pages/hilfsfonds/campaign/corona-covid-19-shutdown-spenden-amp-crowdfunding-323',
    'title': 'StartNext',
    'type': 'solution',
  },
  {
    'category': ['business'],
    'description': 'Too Good To Go ist eine App, mit deren Hilfe Betriebe ihr Essen vertreiben können, indem Kunden die Waren selber abholen.',
    'imageUrl': 'https://toogoodtogo.de/images/placeholders/front-page/v2/step-third.png',
    'industry': ['retail', 'restaurants' ],
    'link': 'https://toogoodtogo.de/de',
    'title': 'Too-good-to-go',
    'type': 'solution',
  },/*
  {
    'category': ['financial'],
    'recommendation': `Crowdfunding / Finanzspritzen; Übersicht Crowdfunding Plattformen`,
    'type': 'info',
    'industry': ['retail', 'service', 'restaurants', 'culture', 'freelancer'],
    'link': 'http://crowdfunding-portal.de/plattformen'
  },
  {
    'category': ['financial'],
    'description': '',
    'recommendation': `“Too good to go” Konzept`,
    'type': 'info',
    'industry': ['retail', 'service', 'restaurants', 'culture', 'freelancer'],
    'link': 'https://www.startnext.com/pages/hilfsfonds/campaign/corona-covid-19-shutdown-spenden-amp-crowdfunding-323'
  },*/
  {
    'category': ['business'],
    'description': 'Deine Kunden vermissen Dein Café, und Du Deine Kunden. Bringe Ihnen also Deine Leidenschaft für Kaffee bei sich zu Hause näher.',
    'imageUrl': 'https://lokaldigital.next-site.de/wp-content/uploads/2020/03/Corkboard-768x1024.jpg',
    'industry': ['restaurants'],
    'link': 'https://lokaldigital.next-site.de/?p=1',
    'title': `Besuche das Wohnzimmer deiner Kunden über das Internet`,
    'type': 'solution'
  }
];

/**
 * Seeds Elasticsearch: delete index, re-create index with mapping, index pre-defined documents
 * 
 * returns false if one of the steps failed. Returns true if all steps succeeded.
 */
module.exports.seedElasticsearch = function() {

  client.indices.delete({
    index: elasticsearchIndex,
  }).catch((err) => {
    if (err.meta.statusCode !== 404) {
      console.error('failed to delete index', elasticsearchIndex, JSON.stringify(err));
      return false;
    }
  }).then(() => {

    console.log('successfully deleted index');

    client.indices.create({
      index: elasticsearchIndex,
      body: {
        "mappings": {
          "properties": {
            "category": { "type": "keyword" },
            "description": { "type": "text" },
            "imageUrl": { "type": "text" },
            "industry": { "type": "keyword" },
            "link": { "type": "text" },
            "title": { "type": "text" },
            "type": { "type": "keyword" }
          }
        }
      }
    }).catch((err) => {
      console.error('failed to create index', elasticsearchIndex, JSON.stringify(err));
      return false;
    }).then(() => {

      console.log('successfully created index');

      const bulkRequests = [];
      documentsToInsert.forEach(doc => {
        bulkRequests.push({
          index: {
            _index: elasticsearchIndex
          }
        });
        bulkRequests.push(doc);
      });

      client.bulk({
        index: elasticsearchIndex,
        body: bulkRequests
      }).catch((err) => {
        console.error('failed to index documents through bulk request', JSON.stringify(err));
        return false;
      }).then(() => {
        console.log('successfully indexed all documents through bulk request');
        return true;
      });

    });

  });

};
