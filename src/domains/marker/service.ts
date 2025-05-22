import { GetMarkersResponse, NearbyMarkerInfo } from '@/domains/marker/types';
import prisma from '@/utils/database';
import { AuthenticatedRequest } from '@/domains/auth/types';
import { StatusCodes } from 'http-status-codes';
import { getBlockedMembers } from '@/domains/block/service';
import { InternalMember } from '@/domains/member/types';

export async function getMarkers(req: AuthenticatedRequest, res: GetMarkersResponse) {
  const blockedIds = await getBlockedMembers(req.member!);
  const institutionId = (await prisma.member.findUniqueOrThrow({
    where: {
      id: req.member!.id,
    },
    select: {
      institutionId: true,
    }
  })).institutionId;
  const markers = await prisma.marker.findMany({
    include: {
      post: {
        select: {
          expiresAt: true,
          createdAt: true,
          authorId: true,
          markerIdx: true,
          title: true,
          id: true,
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
        },
        institutionId,
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
    postId: marker.post!.id,
    title: marker.post!.title,
    markerIdx: marker.post!.markerIdx,
    latitude: marker.latitude,
    longitude: marker.longitude,
    expiresAt: marker.post!.expiresAt,
    createdAt: marker.post!.createdAt,
    isWrittenBySelf: marker.post?.authorId === req.member?.id,
  }));
  res.status(StatusCodes.OK).json({
    markers: flattened,
  });
}

export async function getNearbyMarkerInfo
(member: InternalMember | number, lat: number, lon: number, radiusKm = 0.1): Promise<NearbyMarkerInfo> {
  const markers = await getNearbyMarkers(member, lat, lon, radiusKm);
  const markerCount = markers.length;
  const nearestMarker = markers[0] ?? null;
  return {
    markerCount, nearestMarker,
  };
}

export async function getNearbyMarkers(member: InternalMember | number, lat: number, lon: number, radiusKm = 0.1) {
  return (await findNearbyMarkers(member, lat, lon, radiusKm)).map(marker => {
    const toRad = (deg: number) => deg * (Math.PI / 180);
    const R = 6371; // Earth radius in km

    const dLat = toRad(marker.latitude - lat);
    const dLon = toRad(marker.longitude - lon);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) *
      Math.cos(toRad(marker.latitude)) *
      Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return {
      marker: {
        markerId: marker.id,
        postId: marker.post!.id,
        latitude: marker.latitude,
        longitude: marker.longitude,
      },
      distance
    };
  }).sort((a, b) => a.distance - b.distance);
}

export async function findNearbyMarkers(member: InternalMember | number, lat: number, lon: number, radiusKm = 0.1) {
  const blockedIds = await getBlockedMembers(member);
  const latDelta = radiusKm / 111;
  const lonDelta = radiusKm / (111 * Math.cos((lat * Math.PI) / 180));
  return prisma.marker.findMany({
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
    select: {
      latitude: true,
      longitude: true,
      post: true,
      id: true,
    },
  });
}

export async function getNearbyMarkerCount(member: InternalMember | number, lat: number, lon: number, radiusKm = 0.1): Promise<number> {
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

