export type Industry = 'IT' | 'FINANCE' | 'EDUCATION' | 'HEALTH' | 'MANUFACTURING' | 'RETAIL' | 'OTHER' | 'COMPANY' | 'STARTUP' | 'ASSOCIATION' | 'SCHOOL' | 'COMMUNICATION_AGENCY';

export interface User {
  _id: { $oid: string };
  phoneNumber?: string;
  country?: string;
  city?: string;
  company?: {
    name?: string;
    jobTitle?: string;
    size?: string;
    industry?: Industry;
  };
  socialNetworks?: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    website?: string;
  };
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'MALE' | 'FEMALE';
  picture?: string;
  password?: string;
  verificationCode?: {
    code: string | null;
    createdAt: string | null;
  };
  role: { $oid: string, name:string, systemRole:boolean,rights:any };
  isActive: boolean;
  registrationCompleted: boolean;
  favorites: any[];
  user: 'Organizer' | 'Member';
  createdAt: {
    $date: { $numberLong: string };
  };
  updatedAt: {
    $date: { $numberLong: string };
  };
  __v: { $numberInt: string };
}

