import {
  addDoc,
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  writeBatch,
  doc
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface Availability {
  id: string;
  startDateTime: Timestamp;
  endDateTime: Timestamp;
  players: number;
  price: number;
  location: string;
  type: string;
}

export const getAvailability = async () => {
  try {
    const availabilitiesCollection = collection(db, 'availabilities');
    const availabilitiesQuery = query(availabilitiesCollection, orderBy('startDateTime', 'asc'));

    const availabilitiesSnapshot = await getDocs(availabilitiesQuery);
    const availabilities: Availability[] = availabilitiesSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        startDateTime: data.startDateTime,
        endDateTime: data.endDateTime,
        players: data.players,
        price: data.price,
        location: data.location,
        title: data.title,
        type: data.type
      };
    });

    return availabilities;
  } catch (error) {
    console.error('Error fetching availabilities:', error);
    throw error;
  }
};

export const createAvailability = async (
  date: Date,
  startTime: string, // Format: "HH:MM" (24-hour)
  endTime: string, // Format: "HH:MM" (24-hour)
  players: number,
  price: number,
  location: string,
  type: string,
  createHourlySlots: boolean = false
) => {
  try {
    // Parse the start time
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startDate = new Date(date);
    startDate.setHours(startHours, startMinutes, 0, 0);

    // Parse the end time
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endDate = new Date(date);
    endDate.setHours(endHours, endMinutes, 0, 0);

    if (createHourlySlots) {
      // Calculate hour difference
      const hourDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60));

      if (hourDiff <= 0) {
        throw new Error('End time must be at least 1 hour after start time for hourly slots');
      }

      const availabilityBatch = writeBatch(db);
      let availabilityHourSlots = 0;

      for (let i = 0; i < hourDiff; i++) {
        const slotStart = new Date(startDate.getTime() + i * 60 * 60 * 1000);
        const slotEnd = new Date(slotStart.getTime() + 60 * 60 * 1000);

        const newAvailability = {
          startDateTime: Timestamp.fromDate(slotStart),
          endDateTime: Timestamp.fromDate(slotEnd),
          players,
          price,
          location,
          type,
          currency: 'GBP'
        };

        const newDocRef = doc(collection(db, 'availabilities'));
        availabilityBatch.set(newDocRef, newAvailability);
        availabilityHourSlots++;
      }

      await availabilityBatch.commit();
      return { success: true, count: availabilityHourSlots };
    } else {
      // Create the availability object
      const newAvailability = {
        startDateTime: Timestamp.fromDate(startDate),
        endDateTime: Timestamp.fromDate(endDate),
        players,
        price,
        location,
        type,
        currency: 'GBP'
      };

      // Add to Firestore
      const availabilitiesCollection = collection(db, 'availabilities');
      const docRef = await addDoc(availabilitiesCollection, newAvailability);

      return { success: true, id: docRef.id, count: 1 };
    }
  } catch (error) {
    console.error('Error creating availability:', error);
    throw error;
  }
};
