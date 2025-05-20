import { Response } from 'express';
import { z } from 'zod';
import {
  GetMarkersResponseBodySchema,
} from '@/domains/marker/schema';

export type GetMarkersResponse = Response<z.infer<typeof GetMarkersResponseBodySchema>>;

export type NearbyMarkerInfo = {
  nearestMarker: NearestMarkerInfo;
  markerCount: number;
};

export type NearestMarkerInfo = {
  marker: {
    markerId: number,
    postId: number,
    latitude: number,
    longitude: number,
  }
  distance: number
};
