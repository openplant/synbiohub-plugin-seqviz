import React from 'react';
import { hydrate } from 'react-dom';
import SeqViz from './SeqViz/SeqViz.jsx';

const data = window.__DATA_ACCURAT_SEQVIZ__;

hydrate(
  <SeqViz style={data.style} size={data.size} displayList={data.displayList} parts={data.parts} />,
  document.getElementById('root--accurat-seqviz')
);
