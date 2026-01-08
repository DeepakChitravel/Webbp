"use client";

import { useEffect, useState } from "react";
import { uploadsUrl } from "@/config";
import { getDoctorSchedulesForSite } from "@/lib/api/doctor-schedule";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  ChevronRight, 
  Star, 
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from "lucide-react";

const DAYS = [
  { key: "Sun", label: "S", fullLabel: "Sunday" },
  { key: "Mon", label: "M", fullLabel: "Monday" },
  { key: "Tue", label: "T", fullLabel: "Tuesday" },
  { key: "Wed", label: "W", fullLabel: "Wednesday" },
  { key: "Thu", label: "T", fullLabel: "Thursday" },
  { key: "Fri", label: "F", fullLabel: "Friday" },
  { key: "Sat", label: "S", fullLabel: "Saturday" },
];

const HomepageBooking = ({ userId }: { userId?: number }) => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setError("Hospital information not available");
      setLoading(false);
      return;
    }

    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getDoctorSchedulesForSite(userId);
        
        if (data.length === 0) {
          setError("No doctors available for booking at this time");
        }
        
        setDoctors(data);
      } catch (err) {
        setError("Failed to load doctor schedules. Please try again.");
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [userId]);

  const getTodayDayKey = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[new Date().getDay()];
  };

  const formatTime = (time: string) => {
    return time.replace(/(AM|PM)/, ' $1').toLowerCase();
  };

  const getAvailableDaysCount = (doctor: any) => {
    if (!doctor.weeklySchedule) return 0;
    return Object.values(doctor.weeklySchedule).filter((day: any) => day?.enabled).length;
  };

  const getNextAvailableSlot = (doctor: any) => {
    const todayKey = getTodayDayKey();
    const todayIndex = DAYS.findIndex(d => d.key === todayKey);
    const sortedDays = [...DAYS.slice(todayIndex), ...DAYS.slice(0, todayIndex)];
    
    for (const day of sortedDays) {
      const schedule = doctor.weeklySchedule?.[day.key];
      if (schedule?.enabled && schedule.slots?.length > 0) {
        return {
          day: day.fullLabel,
          time: schedule.slots[0].from,
          isToday: day.key === todayKey
        };
      }
    }
    return null;
  };

  if (loading) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-700">Loading available doctors...</h3>
            <p className="text-gray-500 mt-2">Please wait while we fetch the schedules</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
            <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Available Doctors</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Calendar className="h-4 w-4" />
            Book Appointments Online
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Available Doctors for Consultation
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Select a doctor and choose your preferred time slot. All consultations are confirmed instantly.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
                <p className="text-gray-600">Available Doctors</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {doctors.reduce((acc, doc) => acc + getAvailableDaysCount(doc), 0)}
                </p>
                <p className="text-gray-600">Available Days This Week</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">Instant</p>
                <p className="text-gray-600">Booking Confirmation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doctor) => {
            const nextSlot = getNextAvailableSlot(doctor);
            const availableDays = getAvailableDaysCount(doctor);
            
            return (
              <div
                key={doctor.id}
                className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md ${
                  selectedDoctor === doctor.id 
                    ? 'ring-2 ring-blue-500 border-blue-500' 
                    : 'border-gray-200'
                }`}
                onClick={() => setSelectedDoctor(doctor.id)}
              >
                {/* Doctor Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <img
                        src={`${uploadsUrl}/${doctor.doctorImage}`}
                        alt={doctor.name}
                        className="w-16 h-16 rounded-xl object-cover border-2 border-white shadow-sm"
                      />
                      <div className="absolute -bottom-1 -right-1 bg-green-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                        Online
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{doctor.name}</h3>
                          <p className="text-sm text-gray-600">{doctor.specialization}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-700">₹{doctor.amount}</p>
                          <p className="text-xs text-gray-500">per consultation</p>
                        </div>
                      </div>
                      
                      {/* Rating & Experience */}
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                          <span className="text-xs font-medium text-gray-700 ml-1">4.8</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          <span className="font-medium">{doctor.experience || '5'}+ years</span> experience
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Available Slot */}
                  {nextSlot && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-800">
                            Next available: {nextSlot.isToday ? 'Today' : nextSlot.day}
                          </span>
                        </div>
                        <span className="text-sm font-semibold text-blue-700">
                          {formatTime(nextSlot.time)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Weekly Schedule */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Weekly Availability
                    </h4>
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full">
                      {availableDays}/{DAYS.length} days
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-7 gap-2">
                    {DAYS.map((day) => {
                      const schedule = doctor.weeklySchedule?.[day.key];
                      const enabled = schedule?.enabled;
                      const isToday = day.key === getTodayDayKey();
                      
                      return (
                        <div
                          key={day.key}
                          className={`flex flex-col items-center p-2 rounded-lg border transition-colors ${
                            isToday 
                              ? 'bg-blue-50 border-blue-300' 
                              : enabled 
                                ? 'bg-green-50 border-green-200' 
                                : 'bg-gray-50 border-gray-200'
                          } ${selectedDay === day.key ? 'ring-2 ring-blue-400' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDay(day.key);
                          }}
                        >
                          <span className={`text-xs font-medium ${
                            isToday ? 'text-blue-700' : enabled ? 'text-green-700' : 'text-gray-500'
                          }`}>
                            {day.label}
                          </span>
                          {isToday && (
                            <span className="text-[10px] text-blue-600 font-medium mt-1">Today</span>
                          )}
                          <div className="mt-1">
                            {enabled ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <XCircle className="h-4 w-4 text-gray-300" />
                            )}
                          </div>
                          {enabled && schedule.slots && (
                            <div className="mt-1 text-[10px] text-center text-gray-600">
                              {schedule.slots.length} slot(s)
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Show Slots for Selected Day */}
                  {selectedDay && doctor.weeklySchedule?.[selectedDay]?.enabled && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-900">
                          Available slots for {DAYS.find(d => d.key === selectedDay)?.fullLabel}
                        </span>
                        <button 
                          onClick={() => setSelectedDay(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Close
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {doctor.weeklySchedule[selectedDay].slots.map((slot: any, i: number) => (
                          <button
                            key={i}
                            className="py-2 px-3 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-colors"
                          >
                            {formatTime(slot.from)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  <button className="w-full mt-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2">
                    Book Appointment
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-full px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span>Available today</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <span>All times are in your local timezone</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Instant confirmation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomepageBooking;