export interface Member {
  _id: { $oid: string };
  phoneNumber: string;
  birthday: {
    $date: { $numberLong: string };
  };
  country: string;
  city: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  picture: string;
  password: string;
  verificationCode: {
    code: string;
    createdAt: { $numberDouble: string };
  };
  role: { $oid: string };
  isActive: boolean;
  registrationCompleted: boolean;
  favorites: any[];
  user: string;
  createdAt: {
    $date: { $numberLong: string };
  };
  updatedAt: {
    $date: { $numberLong: string };
  };
  __v: { $numberInt: string };
}

export interface MembersResponse {
  members: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}