'use strict'

const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'http://localhost:9200' })

const INDEX = 'recommendations';
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
  index: INDEX,
}).catch((err) => {
  if (err.meta.statusCode !== 404) {
    console.error('failed to delete index', INDEX, err);
  }
}).then(() => {

  console.log('successfully deleted index');

  client.indices.create({
    index: INDEX,
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
    console.error('failed to create index', INDEX, err);
  }).then(() => {

    console.log('successfully created index');

    documentsToInsert.forEach(doc => {
      client.index({
        index: INDEX,
        body: doc
      }).catch((err) => {
        console.error('failed to insert document', doc, err);
      }).then(() => {
        console.log('successfully inserted document');
      });

    });

  });

});
