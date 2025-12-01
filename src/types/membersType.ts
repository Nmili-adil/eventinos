import type { User } from './usersType';

export interface Member {
  _id: { $oid: string } | string;
  phoneNumber?: string;
  birthday?: {
    $date: { $numberLong: string };
  } | string;
  country?: string;
  city?: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: 'MALE' | 'FEMALE' | 'Unspecified';
  picture?: string;
  password?: string;
  status?: 'Active' | 'Inactive' | 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'Unspecified';
  verificationCode?: {
    code: string;
    createdAt: { $numberDouble: string };
  };
  role?: { $oid: string } | string;
  isActive?: boolean;
  registrationCompleted?: boolean;
  favorites?: any[];
  user?: string | User;
  createdAt?: {
    $date: { $numberLong: string };
  } | string;
  updatedAt?: {
    $date: { $numberLong: string };
  } | string;
  __v?: { $numberInt: string };
  // New fields from backend response
  qrCode?: string;
  isOrganizator?: boolean;
  verified?: boolean;
  event?: string;
  invitedBy?: string;
}

export interface MembersResponse {
  members: Member[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}