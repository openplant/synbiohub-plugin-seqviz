import React from 'react';
import CDSInline from '../../images/small-icons/CDS-inline.svg';
import CDSReverseComplement from '../../images/small-icons/CDS-reverseComplement.svg';
import AptamerInline from '../../images/small-icons/aptamer-inline.svg';
import AssemblyScarInline from '../../images/small-icons/assembly-scar-inline.svg';
import BiopolymerBaseInline from '../../images/small-icons/biopolymer-base-inline.svg';
import BluntRestrictionSiteInline from '../../images/small-icons/blunt-restriction-site-inline.svg';
import DnaStabilityInline from '../../images/small-icons/dna-stability-inline.svg';
import EngineeredRegionInline from '../../images/small-icons/engineered-region-inline.svg';
import Insulator from '../../images/small-icons/insulator.svg';
import NoGlyphAssignedInline from '../../images/small-icons/no-glyph-assigned-inline.svg';
import NonCodingRnaGeneInline from '../../images/small-icons/non-coding-rna-gene-inline.svg';
import OperatorInline from '../../images/small-icons/operator-inline.svg';
import OriginOfReplicationInline from '../../images/small-icons/origin-of-replication-inline.svg';
import OriginOfTransferInline from '../../images/small-icons/origin-of-transfer-inline.svg';
import OverhangSite5Inline from '../../images/small-icons/overhang-site-5-inline.svg';
import OverhangSite5ReverseComplement from '../../images/small-icons/overhang-site-5-reverseComplement.svg';
import PolyAInline from '../../images/small-icons/poly-a-inline.svg';
import PrimerBindingSiteInline from '../../images/small-icons/primer-binding-site-inline.svg';
import PrimerBindingSiteReverseComplement from '../../images/small-icons/primer-binding-site-reverseComplement.svg';
import PromoterInline from '../../images/small-icons/promoter-inline.svg';
import PromoterReverseComplement from '../../images/small-icons/promoter-reverseComplement.svg';
import ProteinInline from '../../images/small-icons/protein-inline.svg';
import RecombinationSiteInline from '../../images/small-icons/recombination-site-inline.svg';
import ResInline from '../../images/small-icons/res-inline.svg';
import RestrictionSiteInline from '../../images/small-icons/restriction-site-inline.svg';
import RnaInline from '../../images/small-icons/rna-inline.svg';
import SignatureInline from '../../images/small-icons/signature-inline.svg';
import StickyRestrictionSite3Inline from '../../images/small-icons/sticky-restriction-site-3-inline.svg';
import StickyRestrictionSite5Inline from '../../images/small-icons/sticky-restriction-site-5-inline.svg';
import TerminatorInline from '../../images/small-icons/terminator-inline.svg';
import UnspecifiedInline from '../../images/small-icons/unspecified-inline.svg';

const ICON_MAPPING = {
  'CDS-inline': CDSInline,
  'CDS-reverseComplement': CDSReverseComplement,
  'aptamer-inline': AptamerInline,
  'assembly-scar-inline': AssemblyScarInline,
  'biopolymer-base-inline': BiopolymerBaseInline,
  'blunt-restriction-site-inline': BluntRestrictionSiteInline,
  'dna-stability-inline': DnaStabilityInline,
  'engineered-region-inline': EngineeredRegionInline,
  insulator: Insulator,
  'no-glyph-assigned-inline': NoGlyphAssignedInline,
  'non-coding-rna-gene-inline': NonCodingRnaGeneInline,
  'operator-inline': OperatorInline,
  'origin-of-replication-inline': OriginOfReplicationInline,
  'origin-of-transfer-inline': OriginOfTransferInline,
  'overhang-site-5-inline': OverhangSite5Inline,
  'overhang-site-5-reverseComplement': OverhangSite5ReverseComplement,
  'poly-a-inline': PolyAInline,
  'primer-binding-site-inline': PrimerBindingSiteInline,
  'primer-binding-site-reverseComplement': PrimerBindingSiteReverseComplement,
  'promoter-inline': PromoterInline,
  'promoter-reverseComplement': PromoterReverseComplement,
  'protein-inline': ProteinInline,
  'recombination-site-inline': RecombinationSiteInline,
  'res-inline': ResInline,
  'ribosome_entry_site-inline': ResInline,
  'restriction-site-inline': RestrictionSiteInline,
  'rna-inline': RnaInline,
  'signature-inline': SignatureInline,
  'sticky-restriction-site-3-inline': StickyRestrictionSite3Inline,
  'sticky-restriction-site-5-inline': StickyRestrictionSite5Inline,
  'terminator-inline': TerminatorInline,
  'unspecified-inline': UnspecifiedInline,
};

export default function SymbolSVG({ role, orientation }) {
  let Icon = ICON_MAPPING[`${role}-${orientation}`];
  if (!Icon) {
    console.warn(`Missing icon for role = "${role}"!`);
    Icon = () => <div style={{ outline: 'red 2px solid', height: '100%' }} />;
    // Icon = UnspecifiedInline
  }
  return <Icon />;
}
