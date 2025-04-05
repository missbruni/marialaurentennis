import { useQuery } from "@tanstack/react-query";
import { Availability, getAvailability } from "@/graphql/availabilities";
import { useForm } from "react-hook-form";
import React from "react";
import DatePicker from "./DatePicker";

type BookingFormProps = {
  bookingRef: React.RefObject<HTMLDivElement | null>;
};
const BookingForm: React.FC<BookingFormProps> = ({ bookingRef }) => {
  const { register, handleSubmit } = useForm();
  const { data, isLoading, error } = useQuery({
    queryKey: ["availabilities"],
    queryFn: getAvailability,
  });

  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  const onSubmit = (formData: any) => {
    console.log("Form submitted:", formData);
    setSelectedDate(formData.date);
  };

  const filteredAvailabilities = React.useMemo(() => {
    if (!data || !selectedDate) return [];

    return data.filter(
      (availability) =>
        availability.lessonAvailability.availabilityDate === selectedDate
    );
  }, [data, selectedDate]);

  return (
    <section ref={bookingRef} className="bg-gray-50 min-h-screen w-full">
      <div className="flex w-full p-24">
        <div className="flex-1 p-2">
          <h2 className="text-2xl md:text-4xl mb-6 text-gray-800">
            <span className="font-bold text-lime-500">Lessons:</span> Improve
            your game
          </h2>
          <h6 className="text-sm md:text-base text-gray-800">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat.
          </h6>
        </div>
        <div className="p-2 flex flex-2 justify-center items-start">
          <div className="flex flex-col gap-2 w-96">
            <DatePicker
              date={selectedDate}
              onDateChange={(date) => setSelectedDate(date)}
            />

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
              onClick={handleSubmit(onSubmit)}
            >
              Add
            </button>
          </div>
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-800">Loading...</p>}
      {error && (
        <p className="text-center text-red-500">Error loading lessons</p>
      )}

      {/* <div className="w-96">
        <DatePicker date={selectedDate} />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200"
        >
          Add
        </button>
      </div> */}
    </section>
  );
};
export default BookingForm;
