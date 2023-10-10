import * as React from 'react';
import { renderToString } from 'react-dom/server';

import CentralIndexContext from '../handlers/centralIndex';
import { COLOR_BORDER_MAP, darkerColor } from '../../utils/colors';
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
  /** during an annotation hover event, darken all other pieces of the same annotation */
  hoverAnnotation = (className, opacity, ishovered) => {
    const elements = document.getElementsByClassName(className);
    if (ishovered) {
      for (let i = 0; i < elements.length; i += 1) {
        elements[i].style.fillOpacity = opacity;
        elements[i].classList.add('hoveredannotation');
      }
    } else {
      for (let i = 0; i < elements.length; i += 1) {
        elements[i].style.fillOpacity = opacity;
        elements[i].classList.remove('hoveredannotation');
      }
    }
  };

  hoverOtherAnnotationRows = (event, className, opacity, isTooltipShown, text) => {
    event.stopPropagation();
    const elements = document.getElementsByClassName(className);
    if (isTooltipShown) {
      let view = document.getElementsByClassName('la-vz-seqviz')[0].getBoundingClientRect();

      let left = event.clientX - view.left;
      let top = event.clientY - view.top;
      let tooltip = document.getElementById('linear-tooltip');

      let tooltipObject = sbolTooltipStringToObject(text.tooltip);
      let { identifier, name, role, orientation, range } = tooltipForInnerHTML(tooltipObject);

      let symbolSVGString = renderToString(<SymbolSVG role={role} orientation={orientation} />);

      tooltip.innerHTML = `
        <div style="width: 180px; background-color: white; border: solid 2px ${text.color}; border-radius: 2px;">
          <div class="font-name" style="background-color: ${text.color}; padding:6px 5px">${name}</div>
          <div style="background-color: ${text.color}26; padding: 10px 5px;">
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

      tooltip.style.display = 'block';
      tooltip.style.left = left + 20 + 'px';
      tooltip.style.top = top + 'px';
      for (let i = 0; i < elements.length; i += 1) {
        elements[i].style.fillOpacity = opacity;
        elements[i].classList.add('hoveredannotation');
      }
    } else {
      let tooltip = document.getElementById('linear-tooltip');
      tooltip.style.display = 'none';
      for (let i = 0; i < elements.length; i += 1) {
        elements[i].style.fillOpacity = opacity;
        elements[i].classList.remove('hoveredannotation');
      }
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
      strokeWidth: 0.5,
      shapeRendering: 'geometricPrecision',
      cursor: 'pointer',
      fillOpacity: 0.7,
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
                    labelStyle={labelStyle}
                    annStyle={annStyle}
                    hoverAnnotation={this.hoverAnnotation}
                    hoverOtherAnnotationRows={this.hoverOtherAnnotationRows}
                    calcBorderColor={darkerColor}
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
    lineHeight,
    transparentPath,
    inputRef,
    calcBorderColor,
    hoverAnnotation,
    annStyle,
    inlinedAnnotations,
    hoverOtherAnnotationRows,
    labelStyle,
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
        fill={a.color}
        onMouseEnter={(event) => hoverOtherAnnotationRows(event, a.annId, 1.0, true, a)}
        onMouseLeave={(event) => hoverOtherAnnotationRows(event, a.annId, 0.7, false, '')}
        onFocus={() => {}}
        onBlur={() => {}}
        {...annStyle}
      />
    </g>
  );
};
