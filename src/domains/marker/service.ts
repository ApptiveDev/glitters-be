import { GetMarkersResponse } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';

export async function getMarkers(_: AuthenticatedRequest, res: GetMarkersResponse) {
  const markers = await prisma.marker.findMany({
    include: {
      post: {
        select: {
          expires_at: true,
        }
      }
    }
  });
  const flattened = markers.map(marker => ({
    id: marker.id,
    post_id: marker.post_id,
    latitude: marker.latitude,
    longitude: marker.longitude,
    expires_at: marker.post?.expires_at ?? null,
  }));
  res.json({
    markers: flattened,
  });
}
