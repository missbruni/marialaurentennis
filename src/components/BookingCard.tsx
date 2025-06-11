import { formatTime } from "../lib/date";
import { capitalizeWords } from "../lib/string";
import { Booking } from "../services/booking";
import { format } from "date-fns";
import { StatusCard } from "./StatusCard";

const BookingCard = ({ booking }: { booking: Booking }) => {
  const startDate = booking.startDateTime.toDate();
  const now = new Date();

  const formattedDate = format(startDate, 'EEEE, MMMM d yyyy');
  const formattedStartTime = formatTime(booking.startDateTime);
  const formattedEndTime = formatTime(booking.endDateTime);
  const formattedBookedDate = format(booking.createdAt.toDate(), 'MMM d, yyyy');

  const isPast = startDate < now;
  const isCancelled = booking.status === 'cancelled';

  const getStatusInfo = () => {
    if (isCancelled) {
      return {
        statusText: 'Cancelled',
        statusColor: 'red' as const,
        description: 'This lesson has been cancelled.',
         actionText: undefined,
      };
    }

    if (isPast) {
      return {
        statusText: 'Past',
        statusColor: 'gray' as const, 
        description: 'This lesson has been completed.',
        actionText: undefined,
      };
    }

    return {
      statusText: 'Upcoming',
      statusColor: 'green' as const,
      description: 'Your lesson is confirmed.',
      actionText: undefined,
      // actionText: 'Manage Lesson',
    };
  };

  const statusInfo = getStatusInfo();

  const bookingDetails = (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Time:</span>
        <span className="font-medium">
          {formattedStartTime} - {formattedEndTime}
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Location:</span>
        <span className="font-medium">{capitalizeWords(booking.location)}</span>
      </div>
      {booking.type && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Type:</span>
          <span className="font-medium">{capitalizeWords(booking.type)} Lesson</span>
        </div>
      )}
      {booking.price && (
        <div className="flex justify-between">
          <span className="text-muted-foreground">Price:</span>
          <span className="font-medium">£{booking.price}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span className="text-muted-foreground">Booked on:</span>
        <span className="font-medium">{formattedBookedDate}</span>
      </div>
    </div>
  );

  return (
    <StatusCard
      title={formattedDate}
      description={statusInfo.description}
      actionText={statusInfo.actionText}
      statusText={statusInfo.statusText}
      statusColor={statusInfo.statusColor}
      disabled={isPast || isCancelled}
      onClick={() => {
        // TODO: Implement view details action
        console.log('View booking details:', booking.id);
      }}
    >
      {bookingDetails}
    </StatusCard>
  );
}