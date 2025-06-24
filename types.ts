
export enum AppRole {
  NONE,
  USER,
  ADMIN,
}

export interface Flight {
  id: string;
  flightNumber: string;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureTime: string; // HH:mm
  arrivalTime: string; // HH:mm
  airline: string;
  totalSeats: number;
}

export interface Reservation {
  id: string;
  flightId: string;
  passengerName: string;
  reservationTime: string; // ISO string
}

export interface Airport {
  code: string;
  name: string;
  city: string;
}

export interface RouteStat {
  route: string;
  count: number;
}

export interface AirportActivity {
  departures: Flight[];
  arrivals: Flight[];
}
    