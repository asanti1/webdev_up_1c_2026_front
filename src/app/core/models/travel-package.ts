export interface TravelPackage {
  id: string;
  title: string;
  description: string;
  price: number;
  startDate: string | null;
  endDate: string | null;
  availableSlots: number;
  maxSlots: number;
  isActive: boolean;
  imageUrl: string;
  categoryPackage: {
    id: string;
    name: string;
  };
  destination: {
    id: string;
    name: string;
  };
}
