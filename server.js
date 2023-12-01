import express from 'express';
import path from 'path';
import request from 'request';
import filesToParts from './io/filesToParts';

const serialize = require('serialize-javascript');

const app = express();
const port = 5011;
const addr = '0.0.0.0';

app.use(express.json());
//app.use(express.static("public"));

app.get('/seqviz.js', function (req, res) {
  console.log('seqviz.js');
  res.sendFile(path.join(__dirname, 'public', 'seqviz.js'));
});

app.get('/Status', function (req, res) {
  console.log('Status');
  res.status(200).send('The plugin is up and running');
});

app.post('/Evaluate', function (req, res) {
  let type = req.body.type.toString();
  console.log('evaluate ' + type);
  if (type === 'Component' || type === 'ComponentDefinition') {
    res.status(200).send('The app can handle this input');
  } else {
    res.status(404).end();
  }
});

app.all('/Run', async (req, res) => {
  let url =
    req.body.complete_sbol?.toString() ?? 'https://synbiohub.org/public/igem/BBa_B0012/1/sbol';
  let top_level =
    req.body?.top_level?.toString() ?? 'https://synbiohub.org/public/igem/BBa_B0012/1';

  let hostAddr = req.get('host');
  console.log('run url=' + url + ' top=' + top_level + ' hostAddr=' + hostAddr);
  try {
    // Get SBOL file content string
    const csv = await getFileData(url);
    // parse SBOL file to get data for sequence view rendering
    const { displayList, parts } = await filesToParts(csv, {
      topLevel: top_level,
    });

    // Remove color, to clear out that we're setting it on the frontend
    parts.forEach((part) =>
      part.annotations.forEach((annot) => {
        delete annot.color;
      })
    );

    const propdata = {
      style: {
        height: 600,
        width: 1100,
      },
      size: {
        width: 500,
        height: 600,
      },
      displayList: displayList,
      parts: parts,
    };

    const theHtml = `<!doctype html>
                    <html>
                      <head><title>sequence view</title></head>
                      <body>
                        <div id="root--accurat-seqviz"></div>
                        <script type="text/javascript">window.__DATA_ACCURAT_SEQVIZ__ = ${serialize(
                          propdata
                        )}</script>
                        <script type="text/javascript" src="//${hostAddr}/seqviz.js" charset="utf-8"></script>
                      </body>
                    </html>`;
    res.send(theHtml);
  } catch (err) {
    const theHtml = `<!doctype html>
                    <html>
                      <head><title>sequence view</title></head>
                      <body>
                        <div>
                          Error when parsing this file to get sequence data!
                        </div>
                      </body>
                    </html>`;
    res.send(theHtml);
  }
});

function getFileData(url) {
  return new Promise((resolve, reject) => {
    request.get(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        return resolve(body);
      } else {
        console.log('error:', error);
        return reject(error);
      }
    });
  });
}

app.listen(port, () => console.log(`Example app listening at http://${addr}:${port}`));
