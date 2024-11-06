import * as React from 'react';
import { renderToString } from 'react-dom/server';
import CentralIndexContext from '../handlers/centralIndex';
import { colorScale } from '../../utils/colors';
import { sbolTooltipStringToObject, tooltipForInnerHTML } from '../../utils/parser';
import SymbolSVG from '../SymbolSVG.jsx';

/**
 * Used to build up all the path elements. Does not include a display
 * of the annotation name or a line connecting name to annotation
 *
 * one central consideration here is that annotations might overlap with one another.
 * to avoid having those overalp visually, annotations are first moved into rows,
 * which are non-overlapping arrays or annotation arrays, which are then
 * used to create the array of array of annotation paths
 *
 * @type {Function}
 */
export default class Annotations extends React.PureComponent {
  hoverOtherAnnotationRows = (event, annotation) => {
    event.stopPropagation();
    if (annotation) {
      const linearAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-linear-scroller .${annotation.annId}`)
      );
      const circularAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-circular-root .${annotation.annId}`)
      );
      const miniVisbolCards = Array.from(
        document.querySelectorAll(`.mini-visbol .${annotation.annId}`)
      );

      const left = event.clientX;
      const top = event.clientY;
      const tooltip = document.getElementById('linear-tooltip');
      const tooltipObject = sbolTooltipStringToObject(annotation.tooltip);
      const { identifier, name, role, orientation, range } = tooltipForInnerHTML(tooltipObject);
      const symbolSVGString = renderToString(<SymbolSVG role={role} orientation={orientation} />);
      const color = colorScale(annotation.name);
      const lighterColor = `${color}26`;

      tooltip.style.display = 'block';
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.innerHTML = `
        <div style="width: 180px; background-color: white; border: solid 2px ${color}; border-radius: 2px;">
          <div class="font-name" style="background-color: ${color}; padding:6px 5px">${name}</div>
          <div style="background-color: ${lighterColor}; padding: 10px 5px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <div style="color: black;">${role}</div>
              <div>${symbolSVGString}</div>
            </div>
            <div style="color: #a3a3a3">Feature Identifier</div>
            <div style="color: black; margin-bottom: 4px;">${identifier}</div>
            <div style="color: #a3a3a3">Orientation</div>
            <div style="color: black; margin-bottom: 4px;">${orientation}</div>
            <div style="color: #a3a3a3">Segment</div>
            <div style="margin-bottom: 4px; display: flex; justify-content: space-between; align-items: end;">
              <div>${range[0]}</div>
              <div style="height: 1px; background-color: black; width:100%;"></div>
              <div>${range[1]}</div>
            </div>
          </div>
        </div>
      `;

      // FIXME: It almost never works because of lazy rendering in scroller element...
      // if (linearAnnotations[0]) {
      //   const scroller = document.querySelector('.la-vz-linear-scroller');
      //   linearAnnotations[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      // }
      [...linearAnnotations, ...circularAnnotations].forEach((la) => {
        la.classList.add('hoveredannotation');
      });
      miniVisbolCards.forEach((c) => {
        c.style.border = '1px solid black';
      });
    } else {
      const linearAnnotations = Array.from(
        document.querySelectorAll('.la-vz-linear-scroller .hoveredannotation')
      );
      const circularAnnotations = Array.from(
        document.querySelectorAll(`.la-vz-circular-root .hoveredannotation`)
      );
      const miniVisbolCards = Array.from(
        document.querySelectorAll(`.mini-visbol .mini-visbol-card`)
      );

      let tooltip = document.getElementById('linear-tooltip');
      tooltip.style.display = 'none';
      [...linearAnnotations, ...circularAnnotations].forEach((la) => {
        la.classList.remove('hoveredannotation');
      });
      miniVisbolCards.forEach((c) => {
        c.style.border = '1px solid transparent';
      });
    }
  };

  render() {
    const { radius, rowsToSkip, lineHeight, annotations } = this.props;

    // at least 3 rows inward from default radius (ie index row)
    const rowShiftHeight = lineHeight * rowsToSkip;
    const radiusAdjust = lineHeight * 3;
    let currBRadius = radius - radiusAdjust - rowShiftHeight;

    let currTRadius = currBRadius - lineHeight; // top radius

    // shared style object for inlining
    const annStyle = {
      strokeWidth: 1,
      shapeRendering: 'geometricPrecision',
      cursor: 'pointer',
      strokeLinejoin: 'round',
    };
    // this is strictly here to create an invisible path that the
    // annotation name can follow
    const transparentPath = {
      stroke: 'transparent',
      fill: 'transparent',
    };
    const labelStyle = {
      cursor: 'pointer',
    };

    return (
      <CentralIndexContext.Consumer>
        {({ circular }) => (
          <g className="la-vz-circular-annotations">
            {annotations.reduce((acc, anns, i) => {
              if (i) {
                currBRadius -= lineHeight + 3;
                currTRadius -= lineHeight + 3;
              } // increment the annRow radii if on every loop after first

              return acc.concat(
                anns.map((a) => (
                  <SingleAnnotation
                    {...this.props}
                    key={`la-vz-${a.id}-annotation-circular-row`}
                    id={`la-vz-${a.id}-annotation-circular-row`}
                    annotation={a}
                    currBRadius={currBRadius}
                    currTRadius={currTRadius}
                    transparentPath={transparentPath}
                    annStyle={annStyle}
                    hoverOtherAnnotationRows={this.hoverOtherAnnotationRows}
                    centralIndex={circular}
                  />
                ))
              );
            }, [])}
          </g>
        )}
      </CentralIndexContext.Consumer>
    );
  }
}

/**
 * A component for a single annotation within the Circular Viewer
 *
 * @param {AnnotationProps} props for a single Annotation
 */
const SingleAnnotation = (props) => {
  const {
    annotation: a,
    seqLength,
    getRotation,
    generateArc,
    currBRadius,
    currTRadius,
    centralIndex,
    transparentPath,
    inputRef,
    annStyle,
    hoverOtherAnnotationRows,
  } = props;

  // if it crosses the zero index, correct for actual length
  let annLength = a.end >= a.start ? a.end - a.start : seqLength - a.start + a.end;

  // can't make an arc from a full circle
  if (annLength === 0) {
    annLength = 1;
  } else if (annLength === seqLength) {
    annLength = seqLength - 0.1;
  }
  // annLength = annLength === 0 ? seqLength - 0.1 : annLength;

  // how many degrees should it be rotated?
  const rotation = getRotation(a.start);

  if (currBRadius < 0 || currTRadius < 0) {
    return null;
  }

  //is name in top or bottom half?
  const mid = (annLength / 2 + a.start + seqLength - centralIndex) % seqLength;
  const bottomHalf = mid > seqLength * 0.25 && mid < seqLength * 0.75;

  const path = generateArc({
    innerRadius: currBRadius,
    outerRadius: currTRadius,
    length: annLength,
    largeArc: annLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: a.direction === 1,
    arrowREV: a.direction === -1,
  });

  const namePath = generateArc({
    innerRadius: bottomHalf ? currBRadius : currTRadius,
    outerRadius: bottomHalf ? currBRadius : currTRadius,
    length: annLength,
    largeArc: annLength > seqLength / 2,
    sweepFWD: true,
    arrowFWD: false,
    arrowREV: false,
  });

  const circAnnID = `la-vz-${a.id}-circular`;
  return (
    <g id={`la-vz-${a.id}-annotation-circular`} transform={rotation}>
      <path id={circAnnID} d={namePath} {...transparentPath} />
      <path
        d={path}
        id={a.id}
        className={a.annId}
        ref={inputRef(a.id, {
          ref: a.id,
          annref: a.annId,
          start: a.start,
          end: a.end,
          type: 'ANNOTATION',
          direction: a.direction,
        })}
        fill={colorScale(a.name)}
        onMouseEnter={(event) => hoverOtherAnnotationRows(event, a)}
        onMouseLeave={(event) => hoverOtherAnnotationRows(event, null)}
        onFocus={() => {}}
        onBlur={() => {}}
        {...annStyle}
      />
    </g>
  );
};
