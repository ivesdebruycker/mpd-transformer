export interface S {
  $: {
    d: string;
    r: string;
  };
}

interface SegmentTimeline {
  S: S[];
  // Add other properties here
}

interface SegmentTemplate {
  $: {
    media: string;
    initialization: string;
    // Add other properties here
  };
  SegmentTimeline: SegmentTimeline[];
  // Add other properties here
}

interface Representation {
  $: {
    width: string;
    height: string;
    // Add other properties here
  };
  SegmentTemplate: SegmentTemplate[];
  // Add other properties here
}

interface AdaptationSet {
  $: {
    mimeType: string;
    // Add other properties here
  };
  Representation: Representation[];
  // Add other properties here
}

interface Period {
  $: {
    id: string;
    // Add other properties here
  };
  AdaptationSet: AdaptationSet[];
  // Add other properties here
}

export interface MPD {
  Period: Period[];
  // Add other properties here
}
