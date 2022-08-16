// NOTE: This file only needs to exist because we're not sharing type
//       information between the 'notatrix' and 'client' projects at
//       the moment.  Once we migrate the 'server' project to also use
//       TypeScript, we should delete this file!

declare module 'notatrix' {
  export class NxError {
    message: string;
  }

  export interface RelationItem {
    token: BaseToken;
    deprel: string;
  }

  export class RelationSet {
    token: BaseToken;
    _items: RelationItem[];

    get length(): number;

    has(token: BaseToken): boolean;
    clear(origin?: boolean): void;
  }

  type ConlluIndex = unknown;
  type Cg3Index = unknown;
  type CytoscapeIndex = number;
  type SerialIndex = unknown;

  interface Indices {
    absolute?: number;
    conllu: ConlluIndex;
    cg3: Cg3Index;
    cytoscape: CytoscapeIndex;
    serial?: SerialIndex;
    sup?: number;
    ana?: number;
    sub?: number;
  }

  export class Analysis {
    _subTokens: SubToken[];
  }

  export class BaseToken {
    uuid: string;
    isEmpty: boolean;
    name: string;
    form: string;
    upostag: string;
    xpostag: string;
    indices: Indices;
    heads: RelationSet;
    dependents: RelationSet;
    _analyses: Analysis[]|undefined;

    isSuperToken: boolean;

    setEmpty(isEmpty: boolean): void;

    static getTokenIndex(token: BaseToken, format: string): number;
    addHead(head: BaseToken, deprel?: string): boolean;
    modifyHead(head: BaseToken, deprel: string): void;
    removeHead(head: BaseToken): void;
    mapHeads<T>(callback: (item: RelationItem, index?: number) => T): T[];
  }

  export class Token extends BaseToken {
    constructor(
      sent: Sentence,
      serial: {
        form: string;
        isEmpty: boolean;
      },
    );
  }

  export class SubToken extends BaseToken {
  }

  export interface SentenceSerial {
  }

  export interface Options {
    enhanced?: boolean;
    interpretAs?: string;
  }

  export interface SentenceMeta {
    format: string;
  }

  export class Sentence {
    tokens: Token[];
    _meta: SentenceMeta;
    input: string|undefined;
    options: Options;
    isParsed: boolean;
    Error: Error|null;
    root: BaseToken;

    constructor(serial: SentenceSerial|string, options: Options);

    index(): Sentence;
    iterate(callback: (token: BaseToken, sup?: number, ana?: number|null, sub?: number|null) => void): void;
    query(predicate: (token: BaseToken) => boolean): BaseToken[];

    getSuperToken(token: BaseToken): BaseToken|null;

    enhance(): Sentence;
    unenhance(): Sentence;

    split(src: BaseToken, splitAtIndexInput?: number): Sentence;
    combine(src: BaseToken, tar: BaseToken): Sentence;
    merge(src: BaseToken, tar: BaseToken): Sentence;

    to(format: string, options?: Options): any;
  }

  export class Label {
    name: string;
    bColor: string;
    tColor: string;
    desc: string;
  }

  interface LabelWithSentences {
    _label: Label;
    _sents: Set<Sentence>;
  }

  export class Labeler {
    _labels: {[name: string]: LabelWithSentences};
    _filter: Set<string>;

    get(name: string): LabelWithSentences|undefined;

    changeLabelName(oldName: string, newName: string): LabelWithSentences|null;
    changeLabelColor(name: string, desc: string): boolean;
    changeLabelDesc(name: string, desc: string): boolean;

    sentenceInFilter(sent: Sentence): boolean;
    addToFilter(name: string): Set<string>;
    removeFromFilter(name: string): void;

    sentenceHasLabel(sent: Sentence, searching: string): boolean;
    addLabel(name: string, sents: Sentence[]|Set<Sentence>): LabelWithSentences;
    removeLabel(name: string, sents?: Sentence[]): LabelWithSentences|null;

  }

  export interface CorpusSerial {
  }

  export interface CorpusMeta {
    filename: string;
    is_ltr: boolean;
    is_vertical: boolean;
  }

  export class Corpus {
    _labeler: Labeler;
    _meta: CorpusMeta;
    index: number;
    _sentences: Sentence[];
    options: Options;
    filename: string|null;

    serialize(): CorpusSerial;
    static deserialize(serial: CorpusSerial): Corpus;
    static fromString(s: string, options?: Options): Corpus;

    get length(): number;
    get filtered(): Sentence[];

    first(): Corpus;
    next(): Corpus|null;
    prev(): Corpus|null;
    last(): Corpus|null;

    getSentence(index: number): Sentence|null;
    setSentence(indexParam: string|number, textParam?: string): Sentence;
    insertSentence(indexParam?: string|number, textParam?: string): Sentence;
    removeSentence(index: number|undefined): Sentence|null;
  }

  export function detect(input: SentenceSerial|string, options?: Options): string|string[];
  export function split(input: SentenceSerial|string, options: Options): string[];

  namespace funcs {
    export function hashStringToHex(s: string): string;
  }
}
