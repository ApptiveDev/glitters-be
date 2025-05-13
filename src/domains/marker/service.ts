import { GetMarkersResponse } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { StatusCodes } from 'http-status-codes';
import { getBlockedMembers } from '@/domains/block/service';
import { InternalMember } from '@/domains/member/types';

export async function getMarkers(req: AuthenticatedRequest, res: GetMarkersResponse) {
  const blockedIds = await getBlockedMembers(req.member!);
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
        authorId: {
          notIn: blockedIds,
        }
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

export async function getNearbyMarkerCount(member: InternalMember, lat: number, lon: number, radiusKm = 0.1): Promise<number> {
  const blockedIds = await getBlockedMembers(member);
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));

  return prisma.marker.count({
    where: {
      latitude: {
        gte: lat - latDelta,
        lte: lat + latDelta,
      },
      longitude: {
        gte: lon - lonDelta,
        lte: lon + lonDelta,
      },
      post: {
        isDeactivated: false,
        authorId: {
          notIn: blockedIds,
        }
      },
    },
  });
}

