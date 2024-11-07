import { translateDNA as dnaToAminoAcids } from './sequence.js';
import { dnaComplement, reverseComplement } from './parser.js';

const AMINOACIDS_3_LETTERS = {
  A: 'Ala',
  G: 'Gly',
  M: 'Met',
  S: 'Ser',
  C: 'Cys',
  H: 'His',
  N: 'Asn',
  T: 'Thr',
  D: 'Asp',
  I: 'Ile',
  P: 'Pro',
  V: 'Val',
  E: 'Glu',
  K: 'Lys',
  Q: 'Gln',
  W: 'Trp',
  F: 'Phe',
  L: 'Leu',
  R: 'Arg',
  Y: 'Tyr',
  '*': 'Stop',
};

function dnaToAminoAcids3Letter(seq) {
  return dnaToAminoAcids(seq)
    .split('')
    .map((c) => AMINOACIDS_3_LETTERS[c] || '?')
    .join(' ');
}

export function computeTopStrandBases(seq) {
  return seq;
}

export function computeBottomStrandBases53(seq) {
  return reverseComplement(seq);
}

export function computeBottomStrandBases35(seq) {
  return dnaComplement(seq).compSeq;
}

export function computeAminoAcids1Letter(seq) {
  return dnaToAminoAcids(seq);
}

export function computeAminoAcids3Letter(seq) {
  return dnaToAminoAcids3Letter(seq);
}
