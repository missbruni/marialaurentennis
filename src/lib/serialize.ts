import { Timestamp } from 'firebase/firestore';
import type { Availability } from '@/services/availabilities';
import type { SerializedAvailability } from '@/types/availability';

export function serializeTimestamp(timestamp: Timestamp) {
  return {
    seconds: timestamp.seconds,
    nanoseconds: timestamp.nanoseconds
  };
}

export function serializeAvailability(availability: Availability): SerializedAvailability {
  return {
    id: availability.id,
    startDateTime: serializeTimestamp(availability.startDateTime),
    endDateTime: serializeTimestamp(availability.endDateTime),
    players: availability.players,
    price: availability.price,
    location: availability.location,
    type: availability.type,
    status: availability.status,
    pendingUntil: availability.pendingUntil
      ? serializeTimestamp(availability.pendingUntil)
      : undefined
  };
}

export function serializeAvailabilities(availabilities: Availability[]): SerializedAvailability[] {
  return availabilities.map(serializeAvailability);
}

export function deserializeTimestamp(serialized: {
  seconds: number;
  nanoseconds: number;
}): Timestamp {
  return new Timestamp(serialized.seconds, serialized.nanoseconds);
}

export function deserializeAvailability(serialized: SerializedAvailability): Availability {
  return {
    id: serialized.id,
    startDateTime: deserializeTimestamp(serialized.startDateTime),
    endDateTime: deserializeTimestamp(serialized.endDateTime),
    players: serialized.players,
    price: serialized.price,
    location: serialized.location,
    type: serialized.type,
    status: serialized.status,
    pendingUntil: serialized.pendingUntil
      ? deserializeTimestamp(serialized.pendingUntil)
      : undefined
  };
}

export function deserializeAvailabilities(serialized: SerializedAvailability[]): Availability[] {
  return serialized.map(deserializeAvailability);
}
