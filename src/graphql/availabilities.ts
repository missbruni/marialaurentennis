type Availability = {
  title: string;
  lessonAvailability: LessonAvailability & { location: string[] };
};

export interface LessonAvailability {
  availabilityDate: string;
  availabilityStartTime: string;
  availabilityEndTime: string;
  players: number;
  price: number;
  location: string;
  autoGenerateSlots: boolean;
}

export const getAvailability = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API as string, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `
        {
          availabilities {
            nodes {
              title
              lessonAvailability {
                availabilityDate
                availabilityStartTime
                availabilityEndTime
                players,
                location,
                price
              }
            }
          }
        }
      `
    })
  });

  const json = await response.json();
  const availabilities = json.data.availabilities.nodes
    .map((node: Availability) => ({
      ...node.lessonAvailability,
      location: node.lessonAvailability.location[0]
    }))
    .reverse();

  return availabilities as LessonAvailability[];
};
