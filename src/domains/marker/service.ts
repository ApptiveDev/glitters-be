import { GetMarkersResponse } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { StatusCodes } from 'http-status-codes';

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
        isDeactivated: false,
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
  res.status(StatusCodes.OK).json({
    markers: flattened,
  });
}
