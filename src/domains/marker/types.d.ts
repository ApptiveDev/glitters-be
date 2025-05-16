import { Response } from 'express';
import { z } from 'zod';
import {
  GetMarkersResponseBodySchema,
} from '@/domains/marker/schema';
import { Marker } from '@/schemas';

export type GetMarkersResponse = Response<z.infer<typeof GetMarkersResponseBodySchema>>;

export type NearbyMarkerInfo = {
  nearestMarker: NearestMarkerInfo;
  markerCount: number;
};

export type NearestMarkerInfo = Marker & { distance: number };
