export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Reservation {
  id: string;
  reservationDate: string | null;
  totalPassengers: number;
  finalPrice: number | null;
  notes: string | null;
  status: ReservationStatus;
  destination: {
    id: string;
    name: string;
  };
  package: {
    id: string;
    title: string;
    startDate: string | null;
    endDate: string | null;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}
