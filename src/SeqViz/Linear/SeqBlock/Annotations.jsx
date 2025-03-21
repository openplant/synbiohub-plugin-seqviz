import * as React from 'react';
import { colorScale } from '../../../utils/colors';
import { renderToString } from 'react-dom/server';
import { Tooltip } from '../../Tooltip.jsx';

export default class AnnotationRows extends React.PureComponent {
  _oldHoveredAnnotation = null;

  hoverOtherAnnotationRows = (event, annotation) => {
    event.stopPropagation();

    if (annotation === this._oldHoveredAnnotation) {
      const view = document.querySelector('.la-vz-seqviz').getBoundingClientRect();
      const left = event.clientX - view.left + 10;
      const top = event.clientY - view.top + 10;
      const tooltip = document.querySelector('#linear-tooltip');
      tooltip.style.display = 'block';
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      return;
    } else {
      this._oldHoveredAnnotation = annotation;
    }

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

      const view = document.querySelector('.la-vz-seqviz').getBoundingClientRect();
      const left = event.clientX - view.left + 10;
      const top = event.clientY - view.top + 10;

      const tooltip = document.querySelector('#linear-tooltip');
      const tooltipInfo = annotation.tooltip;

      tooltip.style.display = 'block';
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      tooltip.innerHTML = renderToString(<Tooltip info={tooltipInfo} colorScale={colorScale} />);

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
    const {
      annotationRows,
      yDiff,
      findXAndWidth,
      inputRef,
      seqBlockRef,
      onUnmount,
      firstBase,
      lastBase,
      fullSeq,
      elementHeight,
    } = this.props;

    return (
      <g className="la-vz-linear-annotations">
        {annotationRows.map((a, i) => {
          const y = yDiff + elementHeight * i;

          return (
            <AnnotationRow
              key={`ann-row-${y}${firstBase}${lastBase}`}
              annotations={a}
              y={y}
              height={elementHeight}
              inputRef={inputRef}
              seqBlockRef={seqBlockRef}
              onUnmount={onUnmount}
              findXAndWidth={findXAndWidth}
              firstBase={firstBase}
              lastBase={lastBase}
              fullSeq={fullSeq}
              hoverOtherAnnotationRows={this.hoverOtherAnnotationRows}
            />
          );
        })}
      </g>
    );
  }
}

/**
 * a single row of annotations. Multiple of these may be in one seqBlock
 * vertically stacked on top of one another in non-overlapping arrays
 */
class AnnotationRow extends React.PureComponent {
  renderAnnotation = (a, index) => {
    const {
      inputRef,
      seqBlockRef,
      findXAndWidth,
      firstBase,
      lastBase,
      annotations,
      fullSeq,
      bpsPerBlock,
      hoverOtherAnnotationRows,
    } = this.props;

    const { name, direction, start, end } = a;
    const color = colorScale(name);
    const forward = direction === 1;
    const reverse = direction === -1;
    let { x: origX, width } = findXAndWidth(start, end);
    const crossZero = start > end && end < firstBase;

    // does the annotation begin or end within this seqBlock with a directionality?
    const endFWD = forward && end > firstBase && end <= lastBase;
    const endREV = reverse && start >= firstBase && start <= lastBase;

    // does the annotation overflow to the left or the right of this seqBlock?
    let overflowLeft = start < firstBase;
    let overflowRight = end > lastBase || (start === end && fullSeq.length > bpsPerBlock); // start === end means covers whole plasmid

    // if the annotation starts and ends in a SeqBlock, by circling all the way around,
    // it will be rendered twice (once from the firstBase to start and another from
    // end to lastBase)
    // eg: https://user-images.githubusercontent.com/13923102/35816281-54571e70-0a68-11e8-92eb-ab56884337ac.png
    const splitAnnotation =
      annotations.reduce((acc, ann) => {
        if (ann.id === a.id) {
          return acc + 1;
        }
        return acc;
      }, 0) > 1; // is this annotation in two pieces?

    if (splitAnnotation) {
      if (annotations.findIndex((ann) => ann.id === a.id) === index) {
        // we're in the first half of the split annotation
        ({ x: origX, width } = findXAndWidth(firstBase, end));
        overflowLeft = true;
        overflowRight = false;
      } else {
        // we're in the second half of the split annotation
        ({ x: origX, width } = findXAndWidth(start, lastBase));
        overflowLeft = false;
        overflowRight = true;
      }
    } else if (start > end) {
      // the annotation crosses over the zero index and this needs to be accounted for
      // this is very similar to the Block rendering logic in ../Selection/Selection.jsx
      ({ x: origX, width } = findXAndWidth(
        start > lastBase ? firstBase : Math.max(firstBase, start),
        end < firstBase ? lastBase : Math.min(lastBase, end)
      ));

      // if this is the first part of annotation that crosses the zero index
      if (start > firstBase) {
        overflowLeft = true;
        overflowRight = end > lastBase;
      }

      // if this is the second part of an annotation, check if it overflows
      if (end < firstBase) {
        overflowLeft = start < firstBase;
        overflowRight = true;
      }
    } else if (start === end) {
      // the annotation circles the entire plasmid and we aren't currently in a SeqBlock
      // where the annotation starts or ends
      ({ x: origX, width } = findXAndWidth(start, end + fullSeq.length));
    }

    // create padding on either side, vertically, of an annotation
    const height = this.props.height * 0.8;

    const rectProps = {
      shapeRendering: 'geometricPrecision',
    };

    const textProps = {
      dominantBaseline: 'middle',
      cursor: 'pointer',
      textAnchor: 'middle',
      textRendering: 'optimizeLegibility',
      x: width / 2,
      y: height / 2 + 1.4,
      style: {
        color: 'black',
        fontWeight: 400,
      },
    };

    const cW = 4; // jagged cutoff width
    const cH = height / 4; // jagged cutoff height
    const [x, w] = [origX, width];

    // create the SVG path, starting at the topLeft and working clockwise
    // there is additional logic here for if the annotation overflows
    // to the left or right of this seqBlock, where a "jagged edge" is created
    const topLeft = endREV ? `M ${2 * cW} 0` : 'M 0 0';
    const topRight = endFWD ? `L ${width - 2 * cW} 0` : `L ${width} 0`;

    let linePath;
    if (a.type === 'insert') {
      linePath = `${topLeft} ${topRight}`;
    } else {
      let bottomRight = `L ${width} ${height}`; // flat right edge
      if ((overflowRight && width > 2 * cW) || crossZero) {
        bottomRight = `
				L ${width - cW} ${cH}
				L ${width} ${2 * cH}
				L ${width - cW} ${3 * cH}
        L ${width} ${4 * cH}`; // jagged right edge
      } else if (endFWD) {
        bottomRight = `
				L ${width} ${height / 2}
				L ${width - Math.min(2 * cW, w)} ${height}`; // arrow forward
      }

      let bottomLeft = `L 0 ${height} L 0 0`; // flat left edge
      if (overflowLeft && width > 2 * cW) {
        bottomLeft = `
				L 0 ${height}
				L ${cW} ${3 * cH}
				L 0 ${2 * cH}
				L ${cW} ${cH}
				L 0 0`; // jagged left edge
      } else if (endREV) {
        bottomLeft = `
				L ${Math.min(2 * cW, w)} ${height}
				L 0 ${height / 2}
				L ${Math.min(2 * cW, w)} 0`; // arrow reverse
      }

      linePath = `${topLeft} ${topRight} ${bottomRight} ${bottomLeft}`;
    }

    if ((forward && overflowRight) || (forward && crossZero)) {
      if (lastBase - start > 14) {
        linePath += `
      M ${width - 3 * cW} ${cH}
      L ${width - 2 * cW} ${2 * cH}
      L ${width - 3 * cW} ${3 * cH}
      M ${width - 4 * cW} ${cH}
      L ${width - 3 * cW} ${2 * cH}
      L ${width - 4 * cW} ${3 * cH}`; // add double arrow forward
      }
    } else if ((reverse && overflowLeft) || (reverse && crossZero)) {
      if (end - firstBase > 14) {
        linePath += `
      M ${3 * cW} ${3 * cH}
      L ${2 * cW} ${cH * 2}
      L ${3 * cW} ${cH}
      M ${4 * cW} ${3 * cH}
      L ${3 * cW} ${cH * 2}
      L ${4 * cW} ${cH}`; // add double forward reverse
      }
    }
    linePath += 'z';

    let strokeColor;
    if (a.type === 'insert') {
      strokeColor = color;
    } else {
      strokeColor = 'black';
    }

    const annotationPath = (
      <path
        id={a.id}
        ref={inputRef(a.id, {
          ref: a.id,
          annref: a.annId,
          start: start,
          end: end,
          type: 'ANNOTATION',
          element: seqBlockRef,
        })}
        uri={a.uri}
        className={a.annId}
        style={{
          cursor: 'pointer',
          fill: color,
        }}
        {...rectProps}
        d={linePath}
        onFocus={() => 0}
        onBlur={() => 0}
        onMouseEnter={(event) => hoverOtherAnnotationRows(event, a)}
        onMouseMove={(event) => hoverOtherAnnotationRows(event, a)}
        onMouseLeave={(event) => hoverOtherAnnotationRows(event, null)}
      />
    );

    // determine whether the annotation name fits within the width of the annotation
    const nameLength = name.length * 6.75; // aspect ratio of roboto mono is ~0.66
    const nameFits = nameLength < width - 15;

    return (
      <g key={`${a.id}-${firstBase}`} id={a.id} transform={`translate(${x}, 0)`}>
        {annotationPath},
      </g>
    );
  };

  render() {
    const { annotations, width, y } = this.props;

    const height = this.props.height * 0.8;
    const size = { width, height };
    const gTranslate = `translate(0, ${y - 5})`;

    return (
      <g {...size} transform={gTranslate} className="la-vz-linear-annotation-row">
        {annotations.map(this.renderAnnotation)}
      </g>
    );
  }
}
