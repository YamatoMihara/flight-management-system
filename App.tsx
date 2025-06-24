
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { AppRole, Flight, Reservation, Airport, RouteStat, AirportActivity } from './types';
import { MOCK_FLIGHTS, MOCK_AIRPORTS } from './constants';

// Helper: Icon components (simple SVGs)
const UsersIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 016-6h6m6 3h-3m-1-10a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const PlaneIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
  </svg>
);

const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);


// Generic Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md transform transition-all">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-sky-400">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-200 text-2xl">&times;</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

// Flight Card Component
interface FlightCardProps {
  flight: Flight;
  bookedSeats: number;
  onBook?: (flight: Flight) => void;
  isAdminView?: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ flight, bookedSeats, onBook, isAdminView = false }) => {
  const availableSeats = flight.totalSeats - bookedSeats;

  return (
    <div className="bg-gray-800 shadow-lg rounded-lg p-5 border border-gray-700 hover:shadow-sky-500/30 transition-shadow duration-300">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-lg font-bold text-sky-400">{flight.airline} - {flight.flightNumber}</h4>
        {isAdminView && (
          <span className={`text-sm px-2 py-1 rounded-full ${availableSeats > 0 ? 'bg-purple-600' : 'bg-red-600'}`}>
            Occupancy: {bookedSeats} / {flight.totalSeats}
          </span>
        )}
      </div>
      <div className="mb-3">
        <div className="flex items-center justify-between text-sm text-gray-300">
          <div className="flex flex-col items-start">
            <span className="font-semibold text-lg">{flight.origin}</span>
            <span className="text-xs text-gray-400">{flight.originCity}</span>
            <span className="text-xl font-mono">{flight.departureTime}</span>
          </div>
          <ArrowRightIcon className="w-8 h-8 text-gray-500 mx-2" />
          <div className="flex flex-col items-end">
            <span className="font-semibold text-lg">{flight.destination}</span>
            <span className="text-xs text-gray-400">{flight.destinationCity}</span>
            <span className="text-xl font-mono">{flight.arrivalTime}</span>
          </div>
        </div>
      </div>
      {!isAdminView && onBook && (
        <div className="mt-4 text-right">
          {availableSeats > 0 ? (
            <button
              onClick={() => onBook(flight)}
              className="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
              aria-label={`Book flight ${flight.flightNumber}`}
            >
              Book Now ({availableSeats} left)
            </button>
          ) : (
            <span className="text-red-400 font-semibold">Fully Booked</span>
          )}
        </div>
      )}
    </div>
  );
};

// CSV Parsing Function
const parseFlightsFromCSV = (csvText: string, airports: Airport[]): Flight[] => {
  const allLines = csvText.split(/\r\n|\n/).filter(line => line.trim() !== '');
  const flightsArray: Flight[] = [];
  let generatedIdCounter = 0;

  // Assumed CSV format (TAB-separated): Origin[TAB]DepartureTime[TAB]Destination[TAB]ArrivalTime[TAB]FlightNumber
  // Example line: HND\t06:20\tCTS\t07:50\tANA987
  allLines.forEach((line, index) => {
    const data = line.split('\t'); // Use tab as delimiter
    if (data.length === 5) { // Expecting 5 columns
      try {
        const originCode = data[0].trim().toUpperCase();
        const departureTimeStr = data[1].trim();
        const destinationCode = data[2].trim().toUpperCase();
        const arrivalTimeStr = data[3].trim();
        const flightNumber = data[4].trim();

        if (!flightNumber) {
            console.warn(`Skipping row ${index + 1} due to empty flight number. Content: ${line}`);
            return;
        }

        const timeRegex = /^\d{1,2}:\d{2}$/;
        if (!timeRegex.test(departureTimeStr) || !timeRegex.test(arrivalTimeStr)) {
            console.warn(`Invalid time format in row ${index + 1}: '${departureTimeStr}' or '${arrivalTimeStr}'. Skipping line: ${line}`);
            return; 
        }
        
        const normalizeTime = (timeStr: string): string => {
            const parts = timeStr.split(':');
            const h = parts[0].padStart(2, '0');
            const m = parts[1].padStart(2, '0');
            return `${h}:${m}`;
        };

        const departureTime = normalizeTime(departureTimeStr);
        const arrivalTime = normalizeTime(arrivalTimeStr);

        const originAirport = airports.find(ap => ap.code === originCode);
        const destinationAirport = airports.find(ap => ap.code === destinationCode);

        let airline = "Unknown Airline";
        if (flightNumber.toUpperCase().startsWith("NH") || flightNumber.toUpperCase().startsWith("ANA")) airline = "All Nippon Airways";
        else if (flightNumber.toUpperCase().startsWith("JL") || flightNumber.toUpperCase().startsWith("JAL")) airline = "Japan Airlines";
        else if (flightNumber.toUpperCase().startsWith("SKY")) airline = "Skymark Airlines";
        else if (flightNumber.toUpperCase().startsWith("ADO")) airline = "Air Do";
        else if (flightNumber.toUpperCase().startsWith("BC")) airline = "Skymark Airlines"; 
        else if (flightNumber.toUpperCase().startsWith("HD")) airline = "Air Do";


        const flight: Flight = {
          id: `csv-${flightNumber}-${Date.now()}-${generatedIdCounter++}`,
          flightNumber: flightNumber,
          airline: airline,
          origin: originCode,
          originCity: originAirport ? originAirport.city : 'Unknown City',
          destination: destinationCode,
          destinationCity: destinationAirport ? destinationAirport.city : 'Unknown City',
          departureTime: departureTime,
          arrivalTime: arrivalTime,
          totalSeats: 150, 
        };
        flightsArray.push(flight);
      } catch (error) {
        console.error(`Error parsing row ${index + 1}: ${line}`, error);
      }
    } else if (line.trim() !== "") {
        console.warn(`Skipping row ${index + 1} due to incorrect column count. Expected 5, got ${data.length}. Content: ${line}`);
    }
  });
  return flightsArray;
};


// Main App Component
const App: React.FC = () => {
  const [currentRole, setCurrentRole] = useState<AppRole>(AppRole.NONE);
  
  const [reservations, setReservations] = useState<Reservation[]>(() => {
    const savedReservations = localStorage.getItem('flightReservations');
    return savedReservations ? JSON.parse(savedReservations) : [];
  });
  
  const [flights, setFlights] = useState<Flight[]>(() => {
    const savedFlights = localStorage.getItem('flightSchedules');
    try {
        return savedFlights ? JSON.parse(savedFlights) : MOCK_FLIGHTS;
    } catch (error) {
        console.error("Failed to parse saved flights from localStorage", error);
        return MOCK_FLIGHTS;
    }
  });

  useEffect(() => {
    localStorage.setItem('flightReservations', JSON.stringify(reservations));
  }, [reservations]);

  useEffect(() => {
    localStorage.setItem('flightSchedules', JSON.stringify(flights));
  }, [flights]);

  const handleSetRole = (role: AppRole) => {
    setCurrentRole(role);
  };

  const addReservation = (flightId: string, passengerName: string) => {
    const newReservation: Reservation = {
      id: Date.now().toString(),
      flightId,
      passengerName,
      reservationTime: new Date().toISOString(),
    };
    setReservations(prev => [...prev, newReservation]);
  };

  const getBookedSeats = useCallback((flightId: string): number => {
    return reservations.filter(r => r.flightId === flightId).length;
  }, [reservations]);
  
  const handleFlightsUpdate = (newFlights: Flight[]) => {
    setFlights(newFlights);
  };


  // Role Selection View Component
  const RoleSelectionView: React.FC<{ onSelectRole: (role: AppRole) => void }> = ({ onSelectRole }) => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-6">
      <div className="text-center mb-12">
        <PlaneIcon className="w-24 h-24 text-sky-400 mx-auto mb-4" />
        <h1 className="text-5xl font-bold text-gray-100">Flight Management System</h1>
        <p className="text-xl text-gray-400 mt-2">Please select your role to continue.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
        <button
          onClick={() => onSelectRole(AppRole.USER)}
          className="bg-sky-600 hover:bg-sky-700 text-white p-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center"
          aria-label="Select User Access Role"
        >
          <UsersIcon className="w-16 h-16 mb-4" />
          <span className="text-3xl font-semibold">User Access</span>
          <p className="text-sm text-sky-200 mt-1">Browse flights, make reservations, view statistics.</p>
        </button>
        <button
          onClick={() => onSelectRole(AppRole.ADMIN)}
          className="bg-purple-600 hover:bg-purple-700 text-white p-8 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300 flex flex-col items-center"
          aria-label="Select Admin Panel Role"
        >
          <ShieldCheckIcon className="w-16 h-16 mb-4" />
          <span className="text-3xl font-semibold">Admin Panel</span>
          <p className="text-sm text-purple-200 mt-1">Manage flights, view reservation status.</p>
        </button>
      </div>
    </div>
  );

  // User View Component
  const UserView: React.FC<{ flights: Flight[]; onBookFlight: (flight: Flight) => void; getBookedSeatsCount: (flightId: string) => number; onLogout: () => void }> = 
  ({ flights, onBookFlight, getBookedSeatsCount, onLogout }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedOrigin, setSelectedOrigin] = useState('');
    const [selectedDestination, setSelectedDestination] = useState('');
    
    const [statsAirport, setStatsAirport] = useState<string>(MOCK_AIRPORTS[0]?.code || '');
    const [statsTimeHour, setStatsTimeHour] = useState<number>(15);
    const [statsTimeType, setStatsTimeType] = useState<'departure' | 'arrival'>('departure');

    const filteredFlights = useMemo(() => {
      return flights.filter(f => 
        (f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
         f.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
         f.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
         f.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
         f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
         f.destination.toLowerCase().includes(searchTerm.toLowerCase())
         ) &&
        (selectedOrigin ? f.origin === selectedOrigin : true) &&
        (selectedDestination ? f.destination === selectedDestination : true)
      );
    }, [flights, searchTerm, selectedOrigin, selectedDestination]);

    const routeStats: RouteStat[] = useMemo(() => {
      const stats: Record<string, number> = {};
      flights.forEach(f => {
        const routeKey = `${f.origin} (${f.originCity}) → ${f.destination} (${f.destinationCity})`;
        stats[routeKey] = (stats[routeKey] || 0) + 1;
      });
      return Object.entries(stats).map(([route, count]) => ({ route, count })).sort((a,b) => b.count - a.count);
    }, [flights]);

    const airportActivity: AirportActivity = useMemo(() => {
      if (!statsAirport) return { departures: [], arrivals: [] };
      return {
        departures: flights.filter(f => f.origin === statsAirport),
        arrivals: flights.filter(f => f.destination === statsAirport),
      };
    }, [flights, statsAirport]);

    const timeSlotFlights: Flight[] = useMemo(() => {
      return flights.filter(f => {
        const timeToCheck = statsTimeType === 'departure' ? f.departureTime : f.arrivalTime;
        const flightHour = parseInt(timeToCheck.split(':')[0]);
        return flightHour === statsTimeHour;
      });
    }, [flights, statsTimeHour, statsTimeType]);

    const airports = MOCK_AIRPORTS;

    return (
      <div className="p-4 md:p-8 min-h-screen">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-sky-400">User Dashboard</h2>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Change Role</button>
        </div>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-200">Search Flights</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-800 rounded-lg shadow">
            <input 
              type="text" 
              placeholder="Search by flight #, airline, city, airport code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500 placeholder-gray-400"
              aria-label="Search flights"
            />
            <select 
              value={selectedOrigin} 
              onChange={e => setSelectedOrigin(e.target.value)}
              className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500"
              aria-label="Select origin airport"
            >
              <option value="">Any Origin</option>
              {airports.map(ap => <option key={ap.code} value={ap.code}>{ap.name} ({ap.code})</option>)}
            </select>
            <select 
              value={selectedDestination} 
              onChange={e => setSelectedDestination(e.target.value)}
              className="p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500"
              aria-label="Select destination airport"
            >
              <option value="">Any Destination</option>
              {airports.map(ap => <option key={ap.code} value={ap.code}>{ap.name} ({ap.code})</option>)}
            </select>
          </div>
          {flights.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">No flights available. An administrator may need to load a flight schedule.</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlights.length > 0 ? filteredFlights.map(flight => (
              <FlightCard key={flight.id} flight={flight} bookedSeats={getBookedSeatsCount(flight.id)} onBook={onBookFlight} />
            )) : flights.length > 0 && <p className="text-gray-400 col-span-full text-center py-8">No flights match your criteria.</p>}
          </div>
        </section>

        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-6 text-gray-200 pt-4 border-t border-gray-700">Flight Statistics</h3>
          {flights.length === 0 ? <p className="text-gray-400 text-center py-4">Flight statistics cannot be displayed as no flights are loaded.</p> :
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-3 text-sky-400">Flights per Route</h4>
              {routeStats.length > 0 ? 
                <ul className="space-y-1 max-h-60 overflow-y-auto text-sm custom-scrollbar">
                  {routeStats.map(stat => <li key={stat.route} className="text-gray-300">{stat.route}: <span className="font-bold text-sky-300">{stat.count}</span></li>)}
                </ul> : <p className="text-gray-400 text-sm">No route data available.</p>}
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-3 text-sky-400">Airport Activity</h4>
              <select value={statsAirport} onChange={e => setStatsAirport(e.target.value)} className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md mb-3" aria-label="Select airport for activity stats">
                {airports.map(ap => <option key={ap.code} value={ap.code}>{ap.name} ({ap.code})</option>)}
              </select>
              <div className="text-sm">
                <p className="text-gray-300">Departures: <span className="font-bold text-sky-300">{airportActivity.departures.length}</span></p>
                <p className="text-gray-300">Arrivals: <span className="font-bold text-sky-300">{airportActivity.arrivals.length}</span></p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg shadow">
              <h4 className="text-lg font-semibold mb-3 text-sky-400">Flights in Time Slot</h4>
              <div className="flex gap-2 mb-3">
                <input type="number" value={statsTimeHour} onChange={e => setStatsTimeHour(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))} min="0" max="23" className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md" aria-label="Hour for time slot stats"/>
                <select value={statsTimeType} onChange={e => setStatsTimeType(e.target.value as 'departure' | 'arrival')} className="w-1/2 p-2 bg-gray-700 border border-gray-600 rounded-md" aria-label="Select departure or arrival for time slot stats">
                  <option value="departure">Departures</option>
                  <option value="arrival">Arrivals</option>
                </select>
              </div>
              <p className="text-sm text-gray-300">Flights at {String(statsTimeHour).padStart(2, '0')}:00-{String(statsTimeHour).padStart(2, '0')}:59: <span className="font-bold text-sky-300">{timeSlotFlights.length}</span></p>
               {timeSlotFlights.length > 0 && <ul className="space-y-1 max-h-40 overflow-y-auto text-xs mt-2 custom-scrollbar">
                {timeSlotFlights.map(f => <li key={f.id} className="text-gray-400">{f.flightNumber} ({f.origin} → {f.destination}) - {statsTimeType === 'departure' ? f.departureTime : f.arrivalTime}</li>)}
              </ul>}
            </div>
          </div>}
        </section>
      </div>
    );
  };

  // Admin View Component
  const AdminView: React.FC<{ 
    flights: Flight[]; 
    reservations: Reservation[]; 
    getBookedSeatsCount: (flightId: string) => number; 
    onLogout: () => void;
    onFlightsUpdate: (newFlights: Flight[]) => void;
  }> = 
  ({ flights, reservations, getBookedSeatsCount, onLogout, onFlightsUpdate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [csvMessage, setCsvMessage] = useState<string>('');

    const filteredFlights = useMemo(() => {
        return flights.filter(f => 
          f.flightNumber.toLowerCase().includes(searchTerm.toLowerCase()) || 
          f.airline.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.originCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
          f.destinationCity.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }, [flights, searchTerm]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            setSelectedFile(event.target.files[0]);
            setCsvMessage('');
        } else {
            setSelectedFile(null);
        }
    };

    const processCsvFile = () => {
        if (!selectedFile) {
            setCsvMessage('Error: No file selected.');
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                try {
                    const parsedFlights = parseFlightsFromCSV(text, MOCK_AIRPORTS);
                    if (parsedFlights.length > 0) {
                        onFlightsUpdate(parsedFlights);
                        setCsvMessage(`Successfully loaded ${parsedFlights.length} flights from ${selectedFile.name}.`);
                        setSelectedFile(null); 
                        const fileInput = document.getElementById('csvFileInput') as HTMLInputElement;
                        if (fileInput) fileInput.value = ""; 

                    } else {
                        setCsvMessage('Warning: CSV file parsed, but no valid flight data was found. Please check file format and content.');
                    }
                } catch (error) {
                    console.error("Error processing CSV file:", error);
                    setCsvMessage(`Error: Failed to process CSV file. ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            } else {
                setCsvMessage('Error: Could not read file content.');
            }
        };
        reader.onerror = () => {
            setCsvMessage('Error: Failed to read file.');
        };
        reader.readAsText(selectedFile);
    };

    const handleDownloadReservationsCSV = () => {
        if (reservations.length === 0) {
            alert("No reservations to download.");
            return;
        }

        const header = "Flight Number,Origin,Destination,Departure Time,Arrival Time,Passenger Name,Reservation Timestamp\n";
        const csvRows = reservations.map(res => {
            const flight = flights.find(f => f.id === res.flightId);
            const flightNumber = flight?.flightNumber || 'N/A';
            const origin = flight?.origin || 'N/A';
            const destination = flight?.destination || 'N/A';
            const departureTime = flight?.departureTime || 'N/A';
            const arrivalTime = flight?.arrivalTime || 'N/A';
            const passengerName = res.passengerName.includes(',') ? `"${res.passengerName}"` : res.passengerName; // Handle commas in name
            const reservationTime = new Date(res.reservationTime).toLocaleString();
            return `${flightNumber},${origin},${destination},${departureTime},${arrivalTime},${passengerName},${reservationTime}`;
        }).join("\n");

        const csvString = header + csvRows;
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) { 
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "flight_reservations.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };
    
    return (
      <div className="p-4 md:p-8 min-h-screen">
         <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
            <h2 className="text-3xl font-bold text-purple-400">Admin Dashboard</h2>
            <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg">Change Role</button>
        </div>
        
        <section className="mb-8">
          <h3 className="text-2xl font-semibold mb-4 text-gray-200 pt-4 border-t border-gray-700">Manage Flight Data</h3>
          <div className="bg-gray-800 p-6 rounded-lg shadow">
            <label htmlFor="csvFileInput" className="block text-sm font-medium text-gray-300 mb-2">
              Upload Flight Schedule CSV File
            </label>
            <p className="text-xs text-gray-400 mb-2">Expected format (tab-separated): Origin[TAB]DepartureTime[TAB]Destination[TAB]ArrivalTime[TAB]FlightNumber (e.g., HND	06:20	CTS	07:50	ANA987)</p>
            <input
              id="csvFileInput"
              type="file"
              accept=".csv,.tsv,.txt"
              onChange={handleFileChange}
              className="mb-3 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-purple-500 file:text-white hover:file:bg-purple-600 cursor-pointer"
              aria-label="Upload CSV flight schedule"
            />
            <button
              onClick={processCsvFile}
              disabled={!selectedFile}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Load Flights from CSV
            </button>
            {csvMessage && <p className={`mt-3 text-sm ${csvMessage.toLowerCase().startsWith("error") || csvMessage.toLowerCase().startsWith("invalid") || csvMessage.toLowerCase().startsWith("failed") ? 'text-red-400' : (csvMessage.toLowerCase().startsWith("warning") ? 'text-yellow-400' : 'text-green-400')}`}>{csvMessage}</p>}
          </div>
        </section>

        <section className="mb-8">
            <h3 className="text-2xl font-semibold mb-4 text-gray-200 pt-4 border-t border-gray-700">Flight Occupancy</h3>
            <input 
              type="text" 
              placeholder="Search flights..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full p-3 mb-6 bg-gray-700 border border-gray-600 rounded-md focus:ring-purple-500 focus:border-purple-500 placeholder-gray-400"
              aria-label="Search flights for occupancy view"
            />
            {flights.length === 0 && <p className="text-gray-400 col-span-full text-center py-8">No flights loaded. Upload a CSV file to see flight occupancy.</p>}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFlights.map(flight => (
                    <FlightCard key={flight.id} flight={flight} bookedSeats={getBookedSeatsCount(flight.id)} isAdminView />
                ))}
            </div>
            {flights.length > 0 && filteredFlights.length === 0 && <p className="text-gray-400 text-center py-4">No flights match your search term.</p>}
        </section>

        <section>
            <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-700">
                <h3 className="text-2xl font-semibold text-gray-200">All Reservations ({reservations.length})</h3>
                {reservations.length > 0 && (
                     <button
                        onClick={handleDownloadReservationsCSV}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
                        aria-label="Download all reservations as CSV"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        Download CSV
                    </button>
                )}
            </div>
            {reservations.length > 0 ? (
              <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-sm text-left text-gray-300">
                    <thead className="text-xs text-purple-300 uppercase bg-gray-750">
                        <tr>
                            <th scope="col" className="px-6 py-3">Flight Number</th>
                            <th scope="col" className="px-6 py-3">Origin</th>
                            <th scope="col" className="px-6 py-3">Destination</th>
                            <th scope="col" className="px-6 py-3">Passenger</th>
                            <th scope="col" className="px-6 py-3">Reserved At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reservations.map(res => {
                            const flightForRes = flights.find(f=>f.id === res.flightId);
                            return (
                                <tr key={res.id} className="bg-gray-800 border-b border-gray-700 hover:bg-gray-700">
                                    <td className="px-6 py-4 font-medium whitespace-nowrap">{flightForRes?.flightNumber || `Unknown (ID: ${res.flightId.substring(0,6)}..)`}</td>
                                    <td className="px-6 py-4">{flightForRes?.origin || 'N/A'}</td>
                                    <td className="px-6 py-4">{flightForRes?.destination || 'N/A'}</td>
                                    <td className="px-6 py-4">{res.passengerName}</td>
                                    <td className="px-6 py-4">{new Date(res.reservationTime).toLocaleString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : <p className="text-gray-400">No reservations yet.</p>}
        </section>
      </div>
    );
  };

  // Booking Modal State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedFlightForBooking, setSelectedFlightForBooking] = useState<Flight | null>(null);
  const [passengerName, setPassengerName] = useState('');

  const handleOpenBookingModal = (flight: Flight) => {
    setSelectedFlightForBooking(flight);
    setPassengerName('');
    setIsBookingModalOpen(true);
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedFlightForBooking(null);
  };

  const handleConfirmBooking = () => {
    if (selectedFlightForBooking && passengerName.trim()) {
      addReservation(selectedFlightForBooking.id, passengerName.trim());
      handleCloseBookingModal();
      alert(`Booking confirmed for ${passengerName} on flight ${selectedFlightForBooking.flightNumber}!`);
    } else {
        alert("Please enter passenger name.");
    }
  };


  // Render logic based on role
  if (currentRole === AppRole.NONE) {
    return <RoleSelectionView onSelectRole={handleSetRole} />;
  }

  if (currentRole === AppRole.USER) {
    return (
      <>
        <UserView 
          flights={flights} 
          onBookFlight={handleOpenBookingModal} 
          getBookedSeatsCount={getBookedSeats}
          onLogout={() => setCurrentRole(AppRole.NONE)}
        />
        {selectedFlightForBooking && (
          <Modal isOpen={isBookingModalOpen} onClose={handleCloseBookingModal} title={`Book Flight: ${selectedFlightForBooking.flightNumber}`}>
            <div className="space-y-4">
              <p className="text-gray-300">You are booking a seat on flight <span className="font-semibold text-sky-400">{selectedFlightForBooking.flightNumber}</span> from {selectedFlightForBooking.originCity} to {selectedFlightForBooking.destinationCity}.</p>
              <div>
                <label htmlFor="passengerName" className="block text-sm font-medium text-gray-300 mb-1">Passenger Name:</label>
                <input 
                  type="text" 
                  id="passengerName"
                  value={passengerName}
                  onChange={e => setPassengerName(e.target.value)}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:ring-sky-500 focus:border-sky-500"
                  required 
                  aria-required="true"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button onClick={handleCloseBookingModal} className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-white transition-colors">Cancel</button>
                <button onClick={handleConfirmBooking} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white font-semibold transition-colors">Confirm Booking</button>
              </div>
            </div>
          </Modal>
        )}
      </>
    );
  }

  if (currentRole === AppRole.ADMIN) {
    return <AdminView 
              flights={flights} 
              reservations={reservations} 
              getBookedSeatsCount={getBookedSeats} 
              onLogout={() => setCurrentRole(AppRole.NONE)}
              onFlightsUpdate={handleFlightsUpdate}
            />;
  }

  return <div className="text-red-500 p-8 text-center">Error: Invalid application state. Please refresh.</div>;
};

export default App;
