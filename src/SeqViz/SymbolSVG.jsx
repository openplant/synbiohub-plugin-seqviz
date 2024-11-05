import React from 'react';
import AptamerInline from '../../images/small-icons/aptamer-inline.svg';
import AssemblyScarInline from '../../images/small-icons/assembly-scar-inline.svg';
import BiopolymerBaseInline from '../../images/small-icons/biopolymer-base-inline.svg';
import BluntRestrictionSiteInline from '../../images/small-icons/blunt-restriction-site-inline.svg';
import CDSInline from '../../images/small-icons/CDS-inline.svg';
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
import PromoterInline from '../../images/small-icons/promoter-inline.svg';
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
  cds: CDSInline,
  aptamer: AptamerInline,
  'assembly-scar': AssemblyScarInline,
  'biopolymer-base': BiopolymerBaseInline,
  'blunt-restriction-site': BluntRestrictionSiteInline,
  'dna-stability': DnaStabilityInline,
  'engineered-region': EngineeredRegionInline,
  insulator: Insulator,
  'no-glyph-assigned': NoGlyphAssignedInline,
  'non-coding-rna-gene': NonCodingRnaGeneInline,
  operator: OperatorInline,
  'origin-of-replication': OriginOfReplicationInline,
  'origin-of-transfer': OriginOfTransferInline,
  'overhang-site-5': OverhangSite5Inline,
  'poly-a': PolyAInline,
  'primer-binding-site': PrimerBindingSiteInline,
  promoter: PromoterInline,
  protein: ProteinInline,
  'recombination-site': RecombinationSiteInline,
  res: ResInline,
  'ribosome-entry-site': ResInline, // EXCEPTION
  'restriction-site': RestrictionSiteInline,
  rna: RnaInline,
  signature: SignatureInline,
  'sticky-restriction-site-3': StickyRestrictionSite3Inline,
  'sticky-restriction-site-5': StickyRestrictionSite5Inline,
  terminator: TerminatorInline,
  unspecified: UnspecifiedInline,
  // Only exception of not rotated
  'overhang-site-5-reverseComplement': OverhangSite5ReverseComplement,
};

export default function SymbolSVG({ role, orientation }) {
  const cleanedRole = role.replaceAll('_', '-').toLowerCase();
  const isReverse = orientation === 'reverseComplement';
  const InlineIcon = ICON_MAPPING[cleanedRole];
  const ReverseIconIfExists = ICON_MAPPING[cleanedRole + '-reverseComplement'];

  let Icon = (isReverse && ReverseIconIfExists) || InlineIcon;
  let toRotate = isReverse && !ReverseIconIfExists;

  if (!Icon) {
    console.log(`Missing icon for role = "${role}"! Using the UnspecifiedInline icon...`);
    Icon = UnspecifiedInline;
    toRotate = false;
  }
  return (
    <svg width="32px" height="32px" style={{ transform: toRotate ? 'rotate(180deg)' : '' }}>
      <Icon />
    </svg>
  );
}
