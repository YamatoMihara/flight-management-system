
import { Flight, Airport } from './types';

export const MOCK_AIRPORTS: Airport[] = [
  { code: "HND", name: "Haneda Airport", city: "Tokyo" },
  { code: "CTS", name: "New Chitose Airport", city: "Sapporo" },
  { code: "NRT", name: "Narita International Airport", city: "Tokyo" },
  { code: "KIX", name: "Kansai International Airport", city: "Osaka" },
  { code: "FUK", name: "Fukuoka Airport", city: "Fukuoka" },
  { code: "OKA", name: "Naha Airport", city: "Okinawa" },
];

export const MOCK_FLIGHTS: Flight[] = [
  { id: "1", flightNumber: "ANA987", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "06:20", arrivalTime: "07:50", airline: "All Nippon Airways", totalSeats: 150 },
  { id: "2", flightNumber: "JAL501", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "06:35", arrivalTime: "08:05", airline: "Japan Airlines", totalSeats: 160 },
  { id: "3", flightNumber: "SKY703", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "06:45", arrivalTime: "08:20", airline: "Skymark Airlines", totalSeats: 120 },
  { id: "4", flightNumber: "ANA4711", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "06:55", arrivalTime: "08:25", airline: "All Nippon Airways", totalSeats: 150 },
  { id: "5", flightNumber: "ADO11", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "06:55", arrivalTime: "08:25", airline: "Air Do", totalSeats: 130 },
  { id: "6", flightNumber: "JAL503", origin: "HND", originCity: "Tokyo", destination: "CTS", destinationCity: "Sapporo", departureTime: "07:20", arrivalTime: "08:50", airline: "Japan Airlines", totalSeats: 160 },
  { id: "7", flightNumber: "ANA053", origin: "NRT", originCity: "Tokyo", destination: "KIX", destinationCity: "Osaka", departureTime: "08:00", arrivalTime: "09:30", airline: "All Nippon Airways", totalSeats: 180 },
  { id: "8", flightNumber: "JAL505", origin: "HND", originCity: "Tokyo", destination: "FUK", destinationCity: "Fukuoka", departureTime: "08:15", arrivalTime: "09:50", airline: "Japan Airlines", totalSeats: 200 },
  { id: "9", flightNumber: "SKY705", origin: "HND", originCity: "Tokyo", destination: "OKA", destinationCity: "Okinawa", departureTime: "08:20", arrivalTime: "10:55", airline: "Skymark Airlines", totalSeats: 120 },
  { id: "10", flightNumber: "ANA055", origin: "KIX", originCity: "Osaka", destination: "HND", destinationCity: "Tokyo", departureTime: "10:30", arrivalTime: "11:35", airline: "All Nippon Airways", totalSeats: 180 },
  { id: "11", flightNumber: "JAL507", origin: "FUK", originCity: "Fukuoka", destination: "HND", destinationCity: "Tokyo", departureTime: "10:30", arrivalTime: "12:00", airline: "Japan Airlines", totalSeats: 200 },
  { id: "12", flightNumber: "ANA057", origin: "HND", originCity: "Tokyo", destination: "FUK", destinationCity: "Fukuoka", departureTime: "15:00", arrivalTime: "16:35", airline: "All Nippon Airways", totalSeats: 150 },
  { id: "13", flightNumber: "JAL3005", origin: "CTS", originCity: "Sapporo", destination: "HND", destinationCity: "Tokyo", departureTime: "15:30", arrivalTime: "17:05", airline: "Japan Airlines", totalSeats: 160 },
  { id: "14", flightNumber: "SKY176", origin: "OKA", originCity: "Okinawa", destination: "HND", destinationCity: "Tokyo", departureTime: "15:45", arrivalTime: "18:00", airline: "Skymark Airlines", totalSeats: 120 },
  { id: "15", flightNumber: "ANA600", origin: "KIX", originCity: "Osaka", destination: "CTS", destinationCity: "Sapporo", departureTime: "16:00", arrivalTime: "17:50", airline: "All Nippon Airways", totalSeats: 140 },
];
    