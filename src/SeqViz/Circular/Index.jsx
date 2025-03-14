import * as React from 'react';

import CentralIndexContext from '../handlers/centralIndex';

/**
 * this component renders the following:
 * 		1. the name (center or bottom)
 * 		2. the number of bps (center or bottom)
 * 		3. the plasmid circle
 * 		4. the index ticks and numbers along the plasmid circle
 *
 * center or bottom here refers to the fact that the name/bps of the
 * part need to be pushed to the bottom of the circular viewer if there
 * are too many elements in the circular viewer and the name won't fit
 */
export default class Index extends React.PureComponent {
  static contextType = CentralIndexContext;

  static getDerivedStateFromProps = (nextProps) => {
    const { seqLength } = nextProps;
    let centralIndex = 0;
    if (this.context) {
      centralIndex = this.context.circular;
    }

    const tickCount = 6;
    // make each increment a multiple of 10 with two sig figs
    const increments = Math.floor(seqLength / tickCount);
    let indexInc = Math.max(+increments.toPrecision(2), 10);
    while (indexInc % 10 !== 0) indexInc += 1;

    // make all the ticks. Also, only keep ticks that are +/- 6 tick incremenets from the top
    // centralIndex, as the others won't be shown/rendered anyway
    let ticks = [];
    for (let i = 0; i <= seqLength - indexInc / 2; i += indexInc) {
      ticks.push(i === 0 ? 1 : i);
    }
    const tickTolerance = indexInc * 6;
    ticks = ticks.filter(
      (t) =>
        Math.abs(centralIndex - t) < tickTolerance ||
        Math.abs(centralIndex + seqLength - t) < tickTolerance ||
        Math.abs(centralIndex - seqLength - t) < tickTolerance
    );
    return { ticks, indexInc };
  };

  state = {
    ticks: [],
    indexInc: 10,
  };

  render() {
    const {
      seq,
      name,
      radius,
      center,
      size,
      yDiff,
      seqLength,
      lineHeight,
      getRotation,
      generateArc,
      findCoor,
      totalRows,
      showIndex,
    } = this.props;
    const { ticks } = this.state;

    if (!showIndex) {
      return null; // don't waste time, don't show
    }

    // split up the name so it fits within spans in the center
    // 30 letters is arbitrary. would be better to first search for "cleaveable characters"
    // like "|" or "," and revert to all chars if those aren't found. Or to decrease
    // name size first before cleaving, etc
    const mostInwardElementRadius = radius - totalRows * lineHeight;
    const cutoff = 30;
    const nameSpans = [];
    let nameIndex = 0;
    // TODO: react freaks out when the circ viewer is small and each line is one char
    // bc there are shared keys (also it's just not a good look)
    while (nameIndex < name.length) {
      nameSpans.push(name.substring(nameIndex, nameIndex + cutoff).trim());
      nameIndex += cutoff;
    }

    // generate the name text for the middle of the plasmid
    const spanCountAdjust = 20 * nameSpans.length; // adjust for each tspan off name
    const nameYAdjust = 14 + spanCountAdjust; // correct for both
    const nameCoorRadius = (nameSpans[0].length / 2) * 12; // 12 px per character

    // if the elements will begin to overlap with the
    // name, move the name downward to the bottom of the viewer
    const nameCoor =
      nameCoorRadius > mostInwardElementRadius
        ? {
            x: center.x,
            y: size.height - nameYAdjust - yDiff,
          }
        : {
            x: center.x,
            y: center.y - ((nameSpans.length - 1) / 2) * 25, // shift the name up for >1 rows of text
          };

    // these are just created once, but are rotated to each position along the plasmid
    const tickCoorStart = findCoor(0, radius);
    const tickCoorEnd = findCoor(0, radius - 15);

    // create tick and text style
    const nameStyle = {
      fontSize: 20,
      textAnchor: 'middle',
      fontWeight: 500,
    };
    const subtitleStyle = {
      fontSize: 14,
      textAnchor: 'middle',
      fill: 'gray',
    };
    const indexCircleStyle = {
      fill: 'transparent',
      stroke: '#CECECE',
      strokeWidth: 1,
    };
    const tickLineStyle = {
      fill: 'transparent',
      stroke: '#cecece',
      strokeWidth: 1,
      shapeRendering: 'geometricPrecision',
    };
    const tickTextStyle = {
      textAnchor: 'middle',
      fontWeight: 300,
      stroke: '#7c7c7c',
    };

    // generate the full circle around the edge of the plasmid
    const indexCurve = generateArc({
      innerRadius: radius,
      outerRadius: radius,
      length: seqLength / 2,
      largeArc: true,
    });
    return (
      <g className="la-vz-circular-index">
        {/* A label showing the name of the plasmid */}
        <text {...nameStyle}>
          {nameSpans.map((n, i) => (
            <tspan key={n} x={nameCoor.x} y={nameCoor.y + i * 25}>
              {n}
            </tspan>
          ))}
        </text>

        {/* A label for the length of the plasmid */}
        <text x={nameCoor.x} y={nameCoor.y + 14 + 25 * (nameSpans.length - 1)} {...subtitleStyle}>
          {`${seqLength} bp`}
        </text>

        {/* The ticks and their index labels */}
        {ticks.map((t) => (
          <g key={`la-vz-${t}_tick`} transform={getRotation(t - 0.5)}>
            <path
              d={`M ${tickCoorStart.x} ${tickCoorStart.y}
                L ${tickCoorEnd.x} ${tickCoorEnd.y}`}
              {...tickLineStyle}
            />
            <text x={tickCoorEnd.x} y={tickCoorEnd.y - lineHeight * 2} {...tickTextStyle}>
              {t}
            </text>
          </g>
        ))}

        {/* The two arcs that make the plasmid's circle */}
        <g>
          <path d={indexCurve} transform={getRotation(seqLength * 0.75)} {...indexCircleStyle} />
          <path d={indexCurve} transform={getRotation(seqLength * 0.25)} {...indexCircleStyle} />
        </g>
      </g>
    );
  }
}
