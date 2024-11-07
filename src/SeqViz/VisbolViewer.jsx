import React from 'react';
import { prepareDisplay } from 'visbol';
import { VisbolRenderer } from './VisbolRenderer.jsx';
import withSelectionHandler from './handlers/selection.jsx';

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

  render() {
    const { inputRef, Visbol, selection, mouseEvent } = this.props;
    const { display } = this.state;
    this.updateReferences(display, inputRef);
    if (display && Visbol) {
      return (
        <VisbolRenderer
          visbolSequence={display.toPlace}
          selection={selection}
          onClick={mouseEvent}
        />
      );
    } else {
      return null;
    }
  }
}

export default withSelectionHandler(VisbolViewer);
