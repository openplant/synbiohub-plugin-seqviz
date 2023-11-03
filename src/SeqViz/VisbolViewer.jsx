import React from 'react';
import { prepareDisplay } from 'visbol';
import Rendering from 'visbol-react';
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
      return (
        // <Rendering
        //   display={display}
        //   selection={this.props.selection ? this.props.selection[0].annref : undefined}
        //   mouseEvent={this.props.mouseEvent}
        //   hideNavigation={true}
        //   size={1.75}
        //   customTooltip={true}
        // />
        <VisbolRenderer visbolSequence={vs}/>
      );
    } else {
      return <div></div>;
    }
  }
}
('<b style="text-align:center;display:block">Feature</b><b>Identifier:</b> annotation10<br/><b>Name:</b> pstS<br/><b>Role:</b> CDS<br/><b>Range:</b> 3254..3501<br/>Orientation: inline 3254..3501<br/>');

export default withSelectionHandler(VisbolViewer);
