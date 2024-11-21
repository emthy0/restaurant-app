import { Restaurant } from './restaurant';

export interface Booking {
  _id: string;
  bookingDate: Date;
  numOfGuests: number;
  user: string;
  restaurant: Restaurant;
  createdAt?: Date;
}
