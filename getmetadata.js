const fs = require(`fs`)
const request = require(`request-promise-native`)
const mkdirp = require(`mkdirp`)
const ProgressBar = require(`progress`)
const { get } = require(`lodash`)
const YAML = require('json2yaml')

let metadata = []

// Make directory to put dataset markdown via saveMD()
mkdirp('./src/datasets', (err) => {
  if (err) console.log(err)
})

const saveMD = _ => {
  Object.keys(metadata).forEach((key) => {
    let content = YAML.stringify(metadata[key])
    content += '---\n'
    fs.writeFileSync(`./src/datasets/${key}.md`, content)
  })
}
  
var fieldsAPI

const getMetadata = _ => {
  let fieldsAPI = `https://data.sfgov.org/resource/cq5k-ka7d.json?$limit=1000000&$select=*,datasetid+as+id`
  let datasetAPI = `https://data.sfgov.org/resource/g9d8-sczp.json?$limit=50000&$where=derived_view='false'`
  let attachmentAPI = `https://data.sfgov.org/resource/6c7s-faz7.json`

  request({ uri: fieldsAPI, encoding: `utf8`, json: true }).then((body) => {
    metadata = body.reduce((prev, curr) => {
      let id = curr.datasetid
      if (prev[id]) {
        prev[id]['fields'] = prev[id]['fields'].concat(curr)
      } else {
        prev[id] = {
          'id': id,
          'dataset_name': curr.dataset_name,
          'department': curr.department,
          'url': curr.open_data_portal_url,
          'fields': [curr]
        }
      }
      return prev
    }, {})
    Promise.all([
      request({ uri: datasetAPI, encoding: `utf8`, json: true }).then((body) => {
        body.forEach(dset => {
          if(metadata[dset.u_id]) {
            metadata[dset.u_id]['description'] = dset.description
            metadata[dset.u_id]['keywords'] = dset.keywords
            metadata[dset.u_id]['url'] = dset.dataset_link.url
            metadata[dset.u_id]['dataset_name'] = dset.name
          }
        })
      }),
      request({ uri: attachmentAPI, encoding: `utf8`, json: true }).then((body) => {
        body.forEach(att => {
          if(metadata[att.dataset_id]) {
            let attachmentObject = {
              name: att.attachment_name,
              url: att.attachment_url
            }
            if(metadata[att.dataset_id]['attachments']) {
              metadata[att.dataset_id]['attachments'] = metadata[att.dataset_id]['attachments'].concat([attachmentObject])
            } else {
              metadata[att.dataset_id]['attachments'] = [attachmentObject]
            }
          }
        })
      })
    ]).then( _ => {
      saveMD()
    })
    
  })
}

getMetadata()