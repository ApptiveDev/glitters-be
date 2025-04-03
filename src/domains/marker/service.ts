import { GetMarkersResponse } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';

export async function getMarkers(_: AuthenticatedRequest, res: GetMarkersResponse) {
  const markers = await prisma.marker.findMany({
    include: {
      post: {
        select: {
          expiresAt: true,
        }
      }
    }
  });
  const flattened = markers.map(marker => ({
    id: marker.id,
    postId: marker.postId,
    latitude: marker.latitude,
    longitude: marker.longitude,
    expiresAt: marker.post?.expiresAt ?? null,
  }));
  res.json({
    markers: flattened,
  });
}
