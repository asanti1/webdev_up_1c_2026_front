export interface CategoryPackage {
  id: string;
  name: string;
  description: string;
  packages: {
    id: string;
    title: string;
    price: number;
  }[];
}
