export type Availability = {
  title: string;
  lessonAvailability: {
    availabilityDate: string;
    availabilityStartTime: string;
    availabilityEndTime: string;
    players: number;
    price: number;
    autoGenerateSlots: boolean;
  };
};

export const getAvailability = async () => {
  const response = await fetch(process.env.NEXT_PUBLIC_GRAPHQL_API as string, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
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
                players
                price
                autoGenerateSlots
              }
            }
          }
        }
      `,
    }),
  });

  const json = await response.json();
  return json.data.availabilities.nodes as Availability[];
};
