import React from 'react';
import { prepareDisplay } from 'visbol';
import { VisbolRenderer } from './VisbolRenderer.jsx';
import withSelectionHandler from './handlers/selection.jsx';
import { sbolTooltipStringToObject, tooltipForInnerHTML } from '../utils/parser.js';

class VisbolViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      display: null,
    };
  }

  componentDidMount = () => {
    this.setList();
  };

  componentDidUpdate = ({ displayList }) => {
    if (displayList.name !== this.props.displayList.name) {
      this.setList();
    }
  };

  setList = () => {
    const { displayList } = this.props;
    this.setState({
      display: prepareDisplay(displayList),
    });
  };

  updateReferences(display, inputRef) {
    if (display) {
      display.renderGlyphs();
      display.toPlace.forEach((item) => {
        if (item.isGlyph) {
          inputRef(item.id, {
            ref: item.id,
            annref: item.id,
            type: 'ANNOTATION',
            ranges: item.ranges,
          });
        }
      });
    }
  }

  visbolSequence(display) {
    return display.toPlace.map((glyph) => {
      let tooltipObject = sbolTooltipStringToObject(glyph.tooltip);
      return tooltipForInnerHTML(tooltipObject);
    });
  }

  render() {
    const { display } = this.state;
    this.updateReferences(display, this.props.inputRef);
    var id = undefined;
    if (this.props.selection && this.props.selection[0]) id = this.props.selection[0].annref;
    if (display && this.props.Visbol) {
      const vs = this.visbolSequence(display);
      return <VisbolRenderer visbolSequence={vs} />;
    } else {
      return <div></div>;
    }
  }
}

export default withSelectionHandler(VisbolViewer);
