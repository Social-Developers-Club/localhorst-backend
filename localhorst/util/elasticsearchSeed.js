'use strict';

const { Client } = require('@elastic/elasticsearch');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const elasticsearchIndex = process.env.ELASTICSEARCH_INDEX || 'recommendations';
const client = new Client({ node: elasticsearchNode });

const documentsToInsert = [
  {
    'category': ['financial'],
    'recommendation': `Mögliche Entschädigung:\nSB haben einen Recht auf ALG 2 (https://selbststaendige.verdi.de/beratung/corona-infopool/++co++aa8e1eea-6896-11ea-bfc7-001a4a160100) Gastronomen haben ein Recht auf Entschädigung, wenn eine amtlich angeordnete Quarantäne vorliegt (https://www.gesetze-im-internet.de/ifsg/IfSG.pdf Absatz 12 §56 ff); Fällt meistens unter Unternehmensrisiko'`,
    'type': 'info',
    'industry': ['freelancer'],
    'link': 'https://www.gesetze-im-internet.de/ifsg/IfSG.pdf'
  },
  {
    'category': ['financial'],
    'recommendation': `KFW`,
    'type': 'info',
    'industry': ['retail', 'service', 'restaurants', 'culture'],
    'link': 'https://www.kfw.de/KfW-Konzern/Newsroom/Aktuelles/KfW-Corona-Hilfe-Unternehmen.html'
  },
  {
    'category': ['financial'],
    'recommendation': `Crowdfunding / Finanzspritzen; Übersicht Crowdfunding Plattformen`,
    'type': 'info',
    'industry': ['retail', 'service', 'restaurants', 'culture', 'freelancer'],
    'link': 'http://crowdfunding-portal.de/plattformen'
  },
  {
    'category': ['financial'],
    'recommendation': `Crowdfunding / Finanzspritzen; Startnext`,
    'type': 'info',
    'industry': ['retail', 'service', 'restaurants', 'culture', 'freelancer'],
    'link': 'https://www.startnext.com/pages/hilfsfonds/campaign/corona-covid-19-shutdown-spenden-amp-crowdfunding-323'
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
      console.error('failed to delete index', elasticsearchIndex, err);
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
            "recommendation": { "type": "text" },
            "type": { "type": "keyword" },
            "industry": { "type": "keyword" },
            "link": { "type": "text" }
          }
        }
      }
    }).catch((err) => {
      console.error('failed to create index', elasticsearchIndex, err);
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
        console.error('failed to index documents through bulk request', err);
        return false;
      }).then(() => {
        console.log('successfully indexed all documents through bulk request');
        return true;
      });

    });

  });

};
