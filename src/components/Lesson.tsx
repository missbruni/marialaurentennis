import React from "react";

import { Availability } from "@/graphql/availabilities";
import { formatCurrency } from "@/lib/currency";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type LessonProps = {
  lesson: Availability;
  onLessonSelected: (lesson: Availability) => void;
};

const Lesson: React.FC<LessonProps> = ({ lesson, onLessonSelected }) => {
  return (
    <Card
      title={lesson.title}
      className="transition-transform hover:translate-y-[-4px] hover:shadow-md cursor-pointer bg-[#eef2ee]"
      onClick={() => onLessonSelected(lesson)}
    >
      <CardHeader>
        <CardTitle>{lesson.title}</CardTitle>
        <CardDescription>
          Time: {lesson.lessonAvailability.availabilityStartTime} -{" "}
          {lesson.lessonAvailability.availabilityEndTime}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 font-medium">
          Price: {formatCurrency(lesson.lessonAvailability.price)}
        </p>
      </CardContent>
    </Card>
  );
};

export default Lesson;

