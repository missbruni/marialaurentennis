import { format } from 'date-fns/format';
import { Availability } from '../graphql/availabilities';
import Lesson from './Lesson';
import { DATE_FORMAT } from './BookingForm';

type AvailableLessonsProps = {
  availableLessons: Availability[];
  date: Date;
};

const AvailableLessons: React.FC<AvailableLessonsProps> = ({ availableLessons, date }) => {
  if (!date) return null;
  const formattedDate = format(date, DATE_FORMAT);

  if (availableLessons.length === 0) {
    return (
      <p className="text-center text-gray-800 px-24 animate-fade-in">
        No lessons available on {formattedDate}
      </p>
    );
  }

  return (
    <div className="px-24 pb-12">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">
        Available Lessons on {formattedDate}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
