import React from 'react';
import * as d3 from 'd3';
import SymbolSVG from './SymbolSVG.jsx';

export const VisbolRenderer = ({ visbolSequence }) => {
  const colorScale = d3.scaleOrdinal([
    '#E8AEB7',
    '#90C1E4',
    '#85E4DC',
    '#B8E986',
    '#82E298',
    '#82ABA1',
    '#057162',
    '#E1DAC0',
    '#FFCC66',
    '#EE9F3A',
    '#FF9966',
    '#E9CA5B',
    '#BAB2FF',
    '#FDBBF9',
    '#A368A8',
    '#4F6382',
  ]);

  return (
    <div style={{ display: 'flex' }}>
      {visbolSequence.map((vs, i) => {
        return <VisbolCard key={i} info={vs} colorScale={colorScale} />;
      })}
    </div>
  );
};

const VisbolCard = ({ info, colorScale }) => {
  const { name, identifier, orientation, role, segment } = info;

  const backgroundColor = colorScale(name);

  return (
    <div style={{ width: 32, height: 32, backgroundColor, borderRadius: 2 }}>
      {/* <div>{name}</div>
      <div>{identifier}</div>
      <div>{orientation}</div>
      <div>{role}</div>
      <div>{segment}</div> */}

      <SymbolSVG role={role} orientation={orientation} />
    </div>
  );
};
