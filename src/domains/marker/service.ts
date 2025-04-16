import { GetMarkersResponse } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';

export async function getMarkers(req: AuthenticatedRequest, res: GetMarkersResponse) {
  const markers = await prisma.marker.findMany({
    include: {
      post: {
        select: {
          expiresAt: true,
          createdAt: true,
          authorId: true,
        }
      }
    },
    where: {
      post: {
        expiresAt: {
          gt: new Date()
        },
      },
    },
    orderBy: {
      post: {
        createdAt: 'desc',
      }
    }
  });
  const flattened = markers.map(marker => ({
    id: marker.id,
    postId: marker.postId,
    latitude: marker.latitude,
    longitude: marker.longitude,
    expiresAt: marker.post?.expiresAt ?? null,
    createdAt: marker.post?.createdAt,
    isWrittenBySelf: marker.post?.authorId === req.member?.id
  }));
  res.json({
    markers: flattened,
  });
}
