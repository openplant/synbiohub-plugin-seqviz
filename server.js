import express from 'express';
import path from 'path';
import request from 'request';
import filesToParts from './io/filesToParts';
import { readFile } from 'fs/promises';

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

// Endpoint used to test the /Run POST endpoint with several inputs.
app.get('/test', (req, res) => {
  readFile('./templates/test.html', 'utf-8').then((html) => {
    res.status(200).send(html);
  });
});

// Endpoint used to get sample datasets for the /Test page.
app.get('/test/sample-data/:file', (req, res) => {
  res.sendFile(path.join(path.resolve(), 'sample-data', req.params.file + '.xml'));
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
  /**
  Receives parameters:
    complete_sbol: The single-use URL for the complete object to operate on
    shallow_sbol: The single-use URL for a summarized or truncated view of the object
    genbank: The single-use URL for the Genbank of the object (Note: This will be a blank website for all types other than Component)
    top_level: The top-level URL of the SBOL object
    instanceUrl: The top-level URL of the synbiohub instance
    size: A number representing an estimate of the size of the object, probably triple count
    type: The RDF type of the top-level object: [
        'Activity', 'Agent', 'Association', 'Attachment', 'Collection',
        'CombinatorialDerivation', 'Component', 'ComponentDefinition', 'Cut',
        'Experiment', 'ExperimentalData', 'FunctionalComponent', 'GenericLocation',
        'Implementation', 'Interaction', 'Location', 'MapsTo', 'Measure',
        'Model', 'Module', 'ModuleDefinition', 'Participation', 'Plan', 'Range',
        'Sequence', 'SequenceAnnotation', 'SequenceConstraint', 'Usage', 'VariableComponent',
      ]
  */
  let url =
    req.body.complete_sbol?.toString() ?? 'https://synbiohub.org/public/igem/BBa_B0012/1/sbol';
  let top_level =
    req.body?.top_level?.toString() ?? 'https://synbiohub.org/public/igem/BBa_B0012/1';

  let hostAddr = req.get('host');
  console.log('run url=' + url + ' top=' + top_level + ' hostAddr=' + hostAddr);
  try {
    console.log(`Get SBOL file content string...`);
    const csv = await getFileData(url);
    console.log(`SBOL file content string:\n${csv}`);
    console.log(`Parse SBOL file to get data for sequence view rendering`);
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
        width: 520,
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
