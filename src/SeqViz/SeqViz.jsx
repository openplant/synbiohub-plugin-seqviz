import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { cutSitesInRows } from '../utils/digest';
import isEqual from '../utils/isEqual';
import { directionality, dnaComplement } from '../utils/parser';
import search from '../utils/search';
import { annotationFactory } from '../utils/sequence';
import CentralIndexContext from './handlers/centralIndex';
import { SelectionContext, defaultSelection } from './handlers/selection.jsx';
import SeqViewer from './SeqViewer.jsx';
import VisbolViewer from './VisbolViewer.jsx';
import {
  computeTopStrandBases,
  computeBottomStrandBases53,
  computeBottomStrandBases35,
  computeAminoAcids1Letter,
  computeAminoAcids3Letter,
} from '../utils/transformSequences.js';
import './style.css';

/**
 * A container for processing part input and rendering either
 * a linear or circular viewer or both
 */
export default class SeqViz extends React.Component {
  static propTypes = {
    annotations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        direction: PropTypes.oneOf([1, 0, -1, 'REVERSE', 'NONE', 'FORWARD']),
        color: PropTypes.string,
        type: PropTypes.string,
      })
    ),
    backbone: PropTypes.string.isRequired,
    bpColors: PropTypes.object.isRequired,
    colors: PropTypes.arrayOf(PropTypes.string).isRequired,
    compSeq: PropTypes.string,
    copyEvent: PropTypes.func.isRequired,
    enzymes: PropTypes.arrayOf(PropTypes.string).isRequired,
    file: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    topLevel: PropTypes.string,
    name: PropTypes.string,
    onSearch: PropTypes.func.isRequired,
    onSelection: PropTypes.func.isRequired,
    search: PropTypes.shape({
      query: PropTypes.string,
      mismatch: PropTypes.number,
    }).isRequired,
    seq: PropTypes.string,
    showComplement: PropTypes.bool.isRequired,
    showIndex: PropTypes.bool.isRequired,
    showPrimers: PropTypes.bool.isRequired,
    style: PropTypes.object.isRequired,
    translations: PropTypes.arrayOf(
      PropTypes.shape({
        start: PropTypes.number.isRequired,
        end: PropTypes.number.isRequired,
        direction: PropTypes.oneOf([1, -1, 'FORWARD', 'REVERSE']).isRequired,
      })
    ).isRequired,
    viewer: PropTypes.oneOf(['linear', 'circular', 'both', 'both_flip']).isRequired,
    zoom: PropTypes.shape({
      circular: PropTypes.number,
      linear: PropTypes.number,
    }).isRequired,
  };

  static defaultProps = {
    size: {
      height: 500,
      width: 1000,
    },
    annotations: [],
    backbone: '',
    bpColors: {},
    colors: [],
    compSeq: '',
    copyEvent: () => false,
    enzymes: [],
    file: null,
    topLevel: '',
    name: '',
    onSearch: (results) => results,
    onSelection: (selection) => selection,
    search: { query: '', mismatch: 0 },
    seq: '',
    showComplement: true,
    showIndex: true,
    showPrimers: true,
    style: {},
    translations: [],
    viewer: 'both',
    zoom: { circular: 0, linear: 50 },
  };

  constructor(props) {
    super(props);

    this.state = {
      accession: '',
      centralIndex: {
        circular: 0,
        linear: 0,
        setCentralIndex: this.setCentralIndex,
      },
      cutSites: [],
      selection: [{ ...defaultSelection }],
      search: [],
      annotations: this.parseAnnotations(props.annotations, props.seq),
      part: {},
    };
  }

  componentDidMount = () => {
    this.setPart();
  };

  // componentDidUpdate = ({ accession, backbone, enzymes, isRender, search }, { part }) => {
  //   if (
  //     accession !== this.props.accession ||
  //     backbone !== this.props.backbone ||
  //     isRender !== this.props.isRender
  //   ) {
  //     this.setPart(); // new accesion/remote ID
  //   } else if (
  //     search.query !== this.props.search.query ||
  //     search.mismatch !== this.props.search.mismatch
  //   ) {
  //     this.search(part); // new search parameters
  //   } else if (!isEqual(enzymes, this.props.enzymes)) {
  //     this.cut(part); // new set of enzymes for digest
  //   }
  // }

  /**
   * Set the part from a file or an accession ID
   */
  setPart = () => {
    const { parts } = this.props;

    this.setState({
      part: {
        ...parts[0],
        annotations: this.parseAnnotations(parts[0].annotations, parts[0].seq),
      },
    });
    this.search(parts[0]);
    this.cut(parts[0]);
  };

  /**
   * Search for the query sequence in the part sequence, set in state
   */
  search = (part = null) => {
    const {
      onSearch,
      search: { query, mismatch },
      seq,
    } = this.props;

    if (!(seq || (part && part.seq))) {
      return;
    }

    const results = search(query, mismatch, seq || part.seq);
    if (isEqual(results, this.state.search)) {
      return;
    }

    this.setState({ search: results });
    onSearch(results);
  };

  /**
   * Find and save enzymes' cutsite locations
   */
  cut = (part = null) => {
    const { enzymes, seq } = this.props;

    const cutSites = enzymes.length ? cutSitesInRows(seq || (part && part.seq) || '', enzymes) : [];

    this.setState({ cutSites });
  };

  /**
   * Modify the annotations to add unique ids, fix directionality and
   * modulo the start and end of each to match SeqViz's API
   */
  parseAnnotations = (annotations, seq) =>
    (annotations || []).map((a, i) => ({
      ...annotationFactory(a.name, i),
      ...a,
      direction: directionality(a.direction),
      start: a.start % (seq.length + 1),
      end: a.end % (seq.length + 1),
    }));

  /**
   * Update the central index of the linear or circular viewer
   */
  setCentralIndex = (type, value) => {
    if (type !== 'linear' && type !== 'circular') {
      throw new Error(`Unknown central index type: ${type}`);
    }

    if (this.state.centralIndex[type] === value) {
      return; // nothing changed
    }

    this.setState({
      centralIndex: { ...this.state.centralIndex, [type]: value },
    });
  };

  /**
   * Update selection in state. Should only be performed from handlers/selection.jsx
   */
  setSelection = (selection) => {
    const { onSelection } = this.props;

    this.setState({ selection });

    onSelection(selection);
  };

  render() {
    const { style, viewer } = this.props;
    let { annotations, compSeq, name, seq, displayList } = this.props;
    const { centralIndex, cutSites, part, search, selection } = this.state;

    // part is either from a file/accession, or each prop was set
    seq = seq || part.seq || '';
    compSeq = compSeq || part.compSeq || dnaComplement(seq).compSeq;
    name = name || part.name;
    annotations = annotations && annotations.length ? annotations : part.annotations || [];

    if (!seq.length) {
      return (
        <div className="la-vz-seqviz">
          <div>Error when parsing this file to get sequence data</div>
        </div>
      );
    }

    const linear = (viewer === 'linear' || viewer.includes('both')) && (
      <SeqViewer
        key="linear"
        {...this.props}
        search={search}
        selection={selection}
        setSelection={this.setSelection}
        annotations={annotations}
        compSeq={compSeq}
        name={name}
        seq={seq}
        cutSites={cutSites}
        Circular={false}
      />
    );
    const circular = (viewer === 'circular' || viewer.includes('both')) && (
      <SeqViewer
        key="circular"
        {...this.props}
        search={search}
        selection={selection}
        setSelection={this.setSelection}
        annotations={annotations}
        compSeq={compSeq}
        name={name}
        seq={seq}
        cutSites={cutSites}
        Circular
      />
    );
    const bothFlipped = viewer === 'both_flip';
    const viewers = bothFlipped ? [linear, circular] : [circular, linear];

    return (
      <div style={{ position: 'relative' }}>
        <div className="la-vz-seqviz" style={{ ...style }}>
          <CentralIndexContext.Provider value={centralIndex}>
            <SelectionContext.Provider value={selection}>
              <CentralIndexContext.Consumer>
                {({ setCentralIndex }) => (
                  <VisbolViewer
                    setCentralIndex={setCentralIndex}
                    displayList={displayList}
                    selection={selection}
                    setSelection={this.setSelection}
                    Visbol={true}
                    name={name}
                    seq={seq}
                  />
                )}
              </CentralIndexContext.Consumer>
              <div className="seq-viewer">{viewers.filter((v) => v).map((v) => v)}</div>
              <SequenceCopierButtons selection={selection} />
            </SelectionContext.Provider>
          </CentralIndexContext.Provider>
        </div>
        <div id="linear-tooltip"></div>
      </div>
    );
  }
}

function SequenceCopierButtons({ selection }) {
  const [displayedSequence, setDisplayedSequence] = useState('');

  const seq = selection[0] ? selection[0].seq : '';

  const copyAndDisplay = (text) => {
    setDisplayedSequence(text);
    if (navigator.clipboarda) {
      navigator.clipboard.writeText(text);
    } else {
      legacyUnsecuredCopyToClipboard(text);
    }

    setTimeout(() => {
      setDisplayedSequence('');
    }, 2000);
  };

  if (!selection || !selection[0] || !selection[0].seq) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '50%',
      }}
    >
      <div
        style={{
          fontFamily: '"Roboto Mono", "monospace"',
          fontSize: 12,
          marginBottom: 5,
          height: 40,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          color: 'gray',
        }}
      >
        {displayedSequence && 'Copied:'}
        <br />
        {displayedSequence}
      </div>
      <div>
        <button
          onClick={() => {
            copyAndDisplay(computeTopStrandBases(seq));
          }}
        >
          Copy Top Strand Bases
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            copyAndDisplay(computeBottomStrandBases53(seq));
          }}
        >
          Copy Bottom Strand Bases 5' → 3'
        </button>
        <button
          onClick={() => {
            copyAndDisplay(computeBottomStrandBases35(seq));
          }}
        >
          Copy Bottom Strand Bases 3' → 5'
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            copyAndDisplay(computeAminoAcids1Letter(seq));
          }}
        >
          Copy Amino Acids 1-Letter
        </button>
        <button
          onClick={() => {
            copyAndDisplay(computeAminoAcids3Letter(seq));
          }}
        >
          Copy Amino Acids 3-Letter
        </button>
      </div>
    </div>
  );
}

function legacyUnsecuredCopyToClipboard(text) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
    alert(`Unable to copy to clipboard: ${text}`);
    console.error('Unable to copy to clipboard', err);
  }
  document.body.removeChild(textArea);
}
