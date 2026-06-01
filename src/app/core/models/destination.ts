export interface Destination {
  id: string;
  name: string;
  description: string;
  country: {
    id: string;
    name: string;
  };
  packages: {
    id: string;
    title: string;
    price: number;
  }[];
}
