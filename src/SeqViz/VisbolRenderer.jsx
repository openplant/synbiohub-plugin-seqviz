import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import SymbolSVG from './SymbolSVG.jsx';
import { colorScale } from '../utils/colors.js';

function lighter(color) {
  const lighterColor = d3.color(color);
  lighterColor.opacity = 0.15;
  return lighterColor.rgb();
}

function computeTextColor(bgColor) {
  const darkText = '#151515';
  const lightText = '#FFFFFF';
  return d3.hsl(bgColor).l < 0.5 ? lightText : darkText;
}

export const VisbolRenderer = ({ visbolSequence }) => {
  const [hovered, setHovered] = useState(null);

  // We're not sure why it's reversed... Fixing it here (sorry)
  const sequence = [...visbolSequence].reverse();

  useEffect(() => {
    if (hovered) {
      const linearAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-linear-scroller .${hovered.id}`)
      );
      const circularAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-circular-root .${hovered.id}`)
      );

      [...linearAnnotations, ...circularAnnotations].forEach((la) => {
        la.classList.add('hoveredannotation');
      });
    }

    return () => {
      const linearAnnotations = Array.from(
        document.querySelectorAll('.la-vz-linear-scroller .hoveredannotation')
      );
      const circularAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-circular-root .hoveredannotation`)
      );

      [...linearAnnotations, ...circularAnnotations].forEach((la) => {
        la.classList.remove('hoveredannotation');
      });
    };
  }, [hovered]);

  return (
    <div
      className="mini-visbol"
      style={{
        display: 'flex',
        gap: 1,
        width: 550,
        justifyContent: sequence.length > 17 ? '' : 'center',
        flexWrap: 'wrap',
      }}
    >
      {sequence.map((vs, i) => {
        return (
          <div
            key={i}
            onMouseEnter={() => setHovered(vs)}
            onMouseLeave={() => setHovered(null)}
            style={{ position: 'relative', paddingTop: 1 }}
          >
            <VisbolCard info={vs} colorScale={colorScale} isHovered={hovered === vs} />

            {hovered === vs && (
              <div style={{ position: 'absolute', top: 40, zIndex: 10 }}>
                <Tooltip info={vs} colorScale={colorScale} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const VisbolCard = ({ info, colorScale, isHovered }) => {
  const { name, orientation, role } = info;
  return (
    <div
      className={`mini-visbol-card ${info.id}`}
      style={{
        width: 32,
        height: 32,
        backgroundColor: colorScale(name),
        borderRadius: 2,
        cursor: 'pointer',
        border: isHovered ? '1px solid black' : '1px solid transparent',
      }}
    >
      <SymbolSVG role={role} orientation={orientation} />
    </div>
  );
};

function Tooltip({ info, colorScale }) {
  const { name, identifier, orientation, role, range } = info;
  const backgroundColor = colorScale(name);
  const lighterColor = lighter(backgroundColor);
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: '0 0 190px',
        margin: '0 2px',
        borderWidth: 2,
        borderStyle: 'solid',
        borderColor: backgroundColor,
        backgroundColor: 'white',
        fontSize: 14,
        fontWeight: 500,
        fontFamily: "'Roboto Mono', monospace",
      }}
    >
      <div
        style={{
          display: 'flex',
          minHeight: '2em',
          color: computeTextColor(backgroundColor),
          backgroundColor: backgroundColor,
          minWidth: 180,
          overflow: 'hidden',
          padding: '8px 6px',
          fontSize: 16,
        }}
      >
        {name}
      </div>
      <div
        style={{
          backgroundColor: lighterColor,
          padding: 4,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 6px',
          }}
        >
          <div style={{ fontSize: 16, color: '#a3a3a3' }}>{role}</div>

          <SymbolSVG role={role} orientation={orientation} />
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: '0 0 auto',
            padding: '8px 6px',
            gap: 6,
          }}
        >
          <div style={{ flex: '0 0 auto' }}>
            <div style={{ color: '#a3a3a3' }}>Feature Identifier</div>
            <div>{identifier}</div>
          </div>

          <div style={{ flex: '0 0 auto' }}>
            <div style={{ color: '#a3a3a3' }}>Orientation</div>
            <div>{orientation}</div>
          </div>

          <div style={{ display: 'flex', flex: '1 0 auto' }} />

          <div style={{ flex: '0 0 auto' }}>
            <div style={{ color: '#a3a3a3' }}>Segment</div>
            <div style={{ display: 'flex', flex: '0 0 auto' }}>
              <div>{range[0]}</div>
              <div
                style={{
                  flex: '1 1 100%',
                  borderBottom: '2px solid black',
                  height: '12px',
                  margin: '0 5px',
                }}
              />
              <div>{range[1]}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
