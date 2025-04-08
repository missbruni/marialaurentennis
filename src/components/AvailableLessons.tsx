import { format } from 'date-fns/format';
import { LessonAvailability } from '../graphql/availabilities';
import Lesson from './Lesson';
import { DATE_FORMAT } from './BookingForm';
import { Typography } from './ui/typography';

type AvailableLessonsProps = {
  availableLessons: LessonAvailability[];
  date: Date;
};

const AvailableLessons: React.FC<AvailableLessonsProps> = ({ availableLessons, date }) => {
  if (!date) return null;
  const formattedDate = format(date, DATE_FORMAT);

  if (availableLessons.length === 0) {
    return (
      <Typography.P className="text-center text-gray-800 px-24 animate-fade-in">
        No lessons available on {formattedDate}
      </Typography.P>
    );
  }

  return (
    <div className="px-24 pb-12 ">
      <Typography.H2 className="text-2xl md:text-3xl mb-6 text-gray-800 text-right">
        <span className="font-bold text-lime-500">Availability</span> on{' '}
        {format(date, 'EEEE, MMMM d')}
      </Typography.H2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-1">
        {availableLessons.map((availability, index) => (
          <Lesson
            key={index}
            lesson={availability}
            onLessonSelected={() => console.log('lesson selected')}
          />
        ))}
      </div>
    </div>
  );
};

export default AvailableLessons;
