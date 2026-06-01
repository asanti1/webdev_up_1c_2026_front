export type UserRoleName = 'USER' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  cellphoneNumber: string;

  role: {
    id: string;
    name: UserRoleName;
  };

  country: {
    id: string;
    name: string;
    isoCode: string;
  };
}
