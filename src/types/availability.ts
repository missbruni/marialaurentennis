// Serialized version of Availability for Server-Client communication
export interface SerializedAvailability {
  id: string;
  startDateTime: {
    seconds: number;
    nanoseconds: number;
  };
  endDateTime: {
    seconds: number;
    nanoseconds: number;
  };
  players: number;
  price: number;
  location: string;
  type: string;
  status?: 'available' | 'pending' | 'booked';
  pendingUntil?: {
    seconds: number;
    nanoseconds: number;
  };
}
