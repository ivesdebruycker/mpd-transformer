import express, { Request, Response } from 'express';
import axios, { AxiosResponse } from 'axios';
import xml2js from 'xml2js';
import { MPD, S } from './types/mpd';

const app: express.Express = express();
const port: number = 3000;

app.get('/', async (req: Request, res: Response) => {
  const url = req.query.url as string;

  if (!url) {
    res.status(400).send('Missing url parameter');
    return;
  }

  try {
    // Load the MPD file from the URL
    const response: AxiosResponse = await axios.get(url);
    const xml: string = response.data;

    // Parse the XML
    const parser: xml2js.Parser = new xml2js.Parser();
    const builder: xml2js.Builder = new xml2js.Builder();
    const parsedXml: { MPD: MPD } = await parser.parseStringPromise(xml);

    // Filter out Period chunks that contain "ad" in the id
    parsedXml.MPD.Period = parsedXml.MPD.Period.filter(
      period => !period.$.id.includes('-ad-')
    );

    // Filter out Representation chunks that do not have width=1920 and height=1080
    parsedXml.MPD.Period.forEach(period => {
      period.AdaptationSet.forEach(adaptationSet => {
        if (adaptationSet.$.mimeType === 'video/mp4') {
          adaptationSet.Representation = adaptationSet.Representation.filter(
            representation =>
              representation.$.width == '1920' &&
              representation.$.height == '1080'
          );
        }
      });
    });

    // Extract all SegmentTimeline children
    let videoSegmentTimelines: S[] = [];
    let audioSegmentTimelines: S[] = [];
    parsedXml.MPD.Period.forEach(period => {
      period.AdaptationSet.forEach(adaptationSet => {
        if (adaptationSet.$.mimeType === 'video/mp4') {
          adaptationSet.Representation.forEach(representation => {
            if (
              representation.SegmentTemplate &&
              representation.SegmentTemplate[0].SegmentTimeline
            ) {
              videoSegmentTimelines.push(
                ...representation.SegmentTemplate[0].SegmentTimeline[0].S
              );
              //delete representation.SegmentTemplate[0].SegmentTimeline[0];
            }
          });
        } else if (adaptationSet.$.mimeType === 'audio/mp4') {
          adaptationSet.Representation.forEach(representation => {
            if (
              representation.SegmentTemplate &&
              representation.SegmentTemplate[0].SegmentTimeline
            ) {
              audioSegmentTimelines.push(
                ...representation.SegmentTemplate[0].SegmentTimeline[0].S
              );
              //delete representation.SegmentTemplate[0].SegmentTimeline[0];
            }
          });
        }
      });
    });
    // console.dir(videoSegmentTimelines, { depth: null });

    // Add all SegmentTimeline children to the first Period
    if (
      parsedXml.MPD.Period[0].AdaptationSet[0].Representation[0]
        .SegmentTemplate[0].SegmentTimeline[0]
    ) {
      parsedXml.MPD.Period[0].AdaptationSet[0].Representation[0].SegmentTemplate[0].SegmentTimeline[0].S =
        videoSegmentTimelines;
    }
    if (
      parsedXml.MPD.Period[0].AdaptationSet[1].Representation[0]
        .SegmentTemplate[0].SegmentTimeline[0]
    ) {
      parsedXml.MPD.Period[0].AdaptationSet[1].Representation[0].SegmentTemplate[0].SegmentTimeline[0].S =
        audioSegmentTimelines;
    }

    parsedXml.MPD.Period = parsedXml.MPD.Period.slice(0, 1);

    // Build the new XML
    const newXml: string = builder.buildObject(parsedXml);

    // Send the new XML
    res.set('Content-Type', 'text/xml');
    res.send(newXml);
  } catch (error) {
    console.error(error);
    res.status(500).send('An error occurred');
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
