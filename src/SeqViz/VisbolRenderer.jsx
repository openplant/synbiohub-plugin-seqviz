import React, { useState, useEffect } from 'react';
import SymbolSVG from './SymbolSVG.jsx';
import { Tooltip } from './Tooltip.jsx';
import { colorScale } from '../utils/colors.js';

export const VisbolRenderer = ({ visbolSequence, selection, onClick }) => {
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
        width: 520,
        justifyContent: sequence.length > 14 ? 'start' : 'center',
        flexWrap: 'wrap',
      }}
    >
      {sequence.map((vs, i) => {
        const selectedId = selection[0] ? selection[0].annref : null;
        return (
          <div
            key={i}
            onMouseEnter={() => setHovered(vs)}
            onMouseLeave={() => setHovered(null)}
            style={{ position: 'relative', paddingTop: 1 }}
          >
            <VisbolCard
              info={{ id: vs.id, ...vs.tooltip }}
              colorScale={colorScale}
              isHovered={hovered === vs}
              isSelected={selectedId === vs.id}
              onClick={onClick}
            />

            {hovered === vs && (
              <div style={{ position: 'absolute', top: 40, zIndex: 10 }}>
                <Tooltip info={vs.tooltip} colorScale={colorScale} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const VisbolCard = ({ info, colorScale, isHovered, isSelected, onClick }) => {
  const { id, name, orientation, role } = info;
  return (
    <div
      className={`mini-visbol-card ${id}`}
      style={{
        width: 32,
        height: 32,
        backgroundColor: colorScale(name),
        borderRadius: 2,
        cursor: 'pointer',
        border: isHovered ? '1px solid black' : '1px solid transparent',
        outline: isSelected ? '1px solid black' : '',
      }}
      onClick={(e) => onClick(e, id)}
    >
      <SymbolSVG role={role} orientation={orientation} />
    </div>
  );
};
