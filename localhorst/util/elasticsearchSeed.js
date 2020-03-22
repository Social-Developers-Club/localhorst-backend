'use strict';

const { Client } = require('@elastic/elasticsearch');

const elasticsearchNode = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';
const index = process.env.ELASTICSEARCH_INDEX || 'recommendations';
const client = new Client({ node: elasticsearchNode });

const documentsToInsert = [
  {
    'category': 'finances',
    'recommendation': `Mögliche Entschädigung:\nSB haben einen Recht auf ALG 2 (https://selbststaendige.verdi.de/beratung/corona-infopool/++co++aa8e1eea-6896-11ea-bfc7-001a4a160100) Gastronomen haben ein Recht auf Entschädigung, wenn eine amtlich angeordnete Quarantäne vorliegt (https://www.gesetze-im-internet.de/ifsg/IfSG.pdf Absatz 12 §56 ff); Fällt meistens unter Unternehmensrisiko'`,
    'type': 'info',
    'industry': 'self-employed',
    'link': 'https://www.gesetze-im-internet.de/ifsg/IfSG.pdf'
  }
]

client.indices.delete({
  index: index,
}).catch((err) => {
  if (err.meta.statusCode !== 404) {
    console.error('failed to delete index', index, err);
  }
}).then(() => {

  console.log('successfully deleted index');

  client.indices.create({
    index: index,
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
    console.error('failed to create index', index, err);
  }).then(() => {

    console.log('successfully created index');

    documentsToInsert.forEach(doc => {
      client.index({
        index: index,
        body: doc
      }).catch((err) => {
        console.error('failed to insert document', doc, err);
      }).then(() => {
        console.log('successfully inserted document');
      });

    });

  });

});
