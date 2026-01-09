"use client";

import { useEffect, useState } from "react";
import { uploadsUrl } from "@/config";
import { getDoctorSchedulesForSite } from "@/lib/api/doctor-schedule";
import { useAuth } from "@/contexts/AuthContext";
import { createDoctorAppointment } from "@/lib/api/doctor-appointments";

import {
  Calendar,
  Clock,
  User,
  ChevronRight,
  Star,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calendar as CalendarIcon,
  X,
  Phone,
  Mail,
  User as UserIcon,
  ShieldCheck,
  CreditCard,
  CalendarDays,
  Clock as ClockIcon,
  BadgeCheck,
  Upload,
  FileText,
  Image as ImageIcon,
  Trash2,
  File,
  Eye,
  X as XIcon
} from "lucide-react";

// Generate calendar days
const generateCalendar = (year: number, month: number) => {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay(); // 0 = Sunday

  const days = [];

  // Previous month's days
  const prevMonthLastDay = new Date(year, month, 0).getDate();
  for (let i = startingDay - 1; i >= 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevMonthLastDay - i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  // Current month's days
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    days.push({
      date,
      isCurrentMonth: true,
      isToday: date.getTime() === today.getTime(),
    });
  }

  // Next month's days
  const totalCells = 42; // 6 weeks * 7 days
  const remainingCells = totalCells - days.length;

  for (let i = 1; i <= remainingCells; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false,
      isToday: false,
    });
  }

  return days;
};

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Convert 24-hour time to 12-hour format with AM/PM
const formatTime12Hour = (time: string) => {
  if (!time) return "";
  
  if (time.includes('AM') || time.includes('PM')) {
    return time.replace(/(AM|PM)/, ' $1').trim();
  }
  
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    if (isNaN(hour)) return time;
    
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    
    return `${hour12}:${minutes} ${ampm}`;
  } catch (e) {
    return time;
  }
};

interface UploadedFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  preview?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: any;
  selectedDate: Date;
  selectedSlot: any;
  user: any;
}

const BookingModal = ({
  isOpen,
  onClose,
  doctor,
  selectedDate,
  selectedSlot,
  user,
}: BookingModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    token: "1",
    notes: ""
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        phone: user.phone || "",
        email: user.email || "",
      }));
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      uploadStatus: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Simulate upload progress
    newFiles.forEach(file => {
      simulateUpload(file.id);
    });
  };

  const simulateUpload = (fileId: string) => {
    setUploadedFiles(prev =>
      prev.map(file =>
        file.id === fileId
          ? { ...file, uploadStatus: 'uploading' }
          : file
      )
    );

    // Simulate upload progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadedFiles(prev =>
        prev.map(file =>
          file.id === fileId
            ? { ...file, uploadProgress: progress }
            : file
        )
      );

      if (progress >= 100) {
        clearInterval(interval);
        setUploadedFiles(prev =>
          prev.map(file =>
            file.id === fileId
              ? { ...file, uploadStatus: 'completed', uploadProgress: 100 }
              : file
          )
        );
      }
    }, 100);
  };

  const removeFile = (fileId: string) => {
    const fileToRemove = uploadedFiles.find(f => f.id === fileId);
    if (fileToRemove?.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-5 w-5 text-blue-500" />;
    if (type === 'application/pdf') return <FileText className="h-5 w-5 text-red-500" />;
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFiles.length > 0) {
      handleFiles(validFiles);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  try {
    // ✅ 1. CREATE FormData FIRST
const formDataWithFiles = new FormData();

formDataWithFiles.append("doctorId", doctor.id.toString());
formDataWithFiles.append("date", selectedDate.toISOString());
formDataWithFiles.append(
  "slot",
  JSON.stringify({
    from: selectedSlot.from,
    to: selectedSlot.to,
  })
);
formDataWithFiles.append("token", formData.token);
formDataWithFiles.append("notes", formData.notes);
formDataWithFiles.append("amount", calculateTotal());

uploadedFiles.forEach((file, index) => {
  formDataWithFiles.append(`files[${index}]`, file.file);
});

const res = await createDoctorAppointment(formDataWithFiles);

if (!res.success) {
  throw new Error(res.message);
}

    // ✅ 3. SUCCESS STATE
    setBookingSuccess(true);

    setTimeout(() => {
      setBookingSuccess(false);
      onClose();
      setFormData({
        name: "",
        phone: "",
        email: "",
        token: "1",
        notes: "",
      });
      setUploadedFiles([]);
    }, 3000);
  } catch (error) {
    console.error("Booking failed:", error);
  } finally {
    setIsSubmitting(false);
  }
};


  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const calculateTotal = () => {
    const tokens = parseInt(formData.token) || 1;
    return (parseFloat(doctor.amount) * tokens).toFixed(2);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <CalendarDays className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Book Appointment</h2>
                <p className="text-gray-600">Confirm your consultation details</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          <div className="grid md:grid-cols-3">
            <div className="md:col-span-2 p-6 border-r border-gray-200">
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-blue-600" />
                  Patient Information
                </h3>

                {bookingSuccess ? (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <BadgeCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-2">Appointment Confirmed!</h4>
                    <p className="text-gray-600 mb-6">
                      Your appointment has been successfully booked. You will receive a confirmation email shortly.
                    </p>
                    <div className="inline-flex items-center gap-2 text-blue-600 font-medium">
                      <ShieldCheck className="h-5 w-5" />
                      Booking ID: APT-{Date.now().toString().slice(-8)}
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Phone className="h-5 w-5 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            placeholder="Enter phone number"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          placeholder="Enter email address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Tokens (Persons)
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(formData.token);
                            if (current > 1) {
                              setFormData({ ...formData, token: (current - 1).toString() });
                            }
                          }}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <span className="w-5 h-5 flex items-center justify-center">−</span>
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.token}
                          onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                          className="w-20 text-center px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const current = parseInt(formData.token);
                            if (current < 10) {
                              setFormData({ ...formData, token: (current + 1).toString() });
                            }
                          }}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          <span className="w-5 h-5 flex items-center justify-center">+</span>
                        </button>
                        <span className="text-sm text-gray-600 ml-2">
                          {formData.token} person{parseInt(formData.token) > 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Each token represents one person for consultation
                      </p>
                    </div>

                    {/* File Upload Section */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Upload Medical Documents (Optional)
                      </label>
                      <p className="text-xs text-gray-500 mb-3">
                        Upload images (JPG, PNG) or PDF files of your previous medical records, prescriptions, or test reports. Maximum 10MB per file.
                      </p>

                      {/* Drag & Drop Area */}
                      <div
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 cursor-pointer ${
                          isDragging
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        <input
                          id="file-upload"
                          type="file"
                          multiple
                          accept="image/*,.pdf"
                          className="hidden"
                          onChange={handleFileSelect}
                        />
                        <div className="flex flex-col items-center justify-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <Upload className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              Click to upload or drag and drop
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              Images (JPG, PNG) or PDF files (Max 10MB each)
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById('file-upload')?.click();
                            }}
                          >
                            Browse Files
                          </button>
                        </div>
                      </div>

                      {/* Uploaded Files List */}
                      {uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          <p className="text-sm font-medium text-gray-700">
                            Uploaded Files ({uploadedFiles.length})
                          </p>
                          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                            {uploadedFiles.map((file) => (
                              <div
                                key={file.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0">
                                    {file.preview ? (
                                      <div className="w-10 h-10 rounded overflow-hidden">
                                        <img
                                          src={file.preview}
                                          alt={file.name}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    ) : (
                                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                                        {getFileIcon(file.type)}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {file.name}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                      <span>{formatFileSize(file.size)}</span>
                                      <span>•</span>
                                      <span className={`px-2 py-0.5 rounded-full ${
                                        file.uploadStatus === 'completed'
                                          ? 'bg-green-100 text-green-800'
                                          : file.uploadStatus === 'uploading'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                        {file.uploadStatus === 'completed' ? 'Uploaded' :
                                         file.uploadStatus === 'uploading' ? 'Uploading...' : 'Pending'}
                                      </span>
                                    </div>
                                    {file.uploadStatus === 'uploading' && (
                                      <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                                        <div
                                          className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                          style={{ width: `${file.uploadProgress}%` }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                  {file.type === 'application/pdf' && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        window.open(URL.createObjectURL(file.file), '_blank');
                                      }}
                                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                                      title="Preview"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFile(file.id);
                                    }}
                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                                    title="Remove"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes (Optional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors h-24 resize-none"
                        placeholder="Any specific concerns, symptoms, or questions for the doctor..."
                      />
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            Confirm & Pay ₹{calculateTotal()}
                          </>
                        )}
                      </button>
                      <p className="text-xs text-gray-500 text-center mt-3">
                        By booking, you agree to our terms and conditions. Your files are securely uploaded.
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>

            <div className="p-6 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Appointment Summary</h3>

              <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 mb-6">
                <img
                  src={`${uploadsUrl}/${doctor.doctorImage}`}
                  alt={doctor.name}
                  className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-sm"
                />
                <div>
                  <h4 className="font-bold text-gray-900">{doctor.name}</h4>
                  <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">4.8</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Appointment Date</p>
                      <p className="font-medium text-gray-900">{formatDate(selectedDate)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <ClockIcon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Time Slot</p>
                      <p className="font-medium text-gray-900">
                        {formatTime12Hour(selectedSlot.from)} - {formatTime12Hour(selectedSlot.to)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-3">Price Breakdown</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation Fee</span>
                      <span className="font-medium">₹{doctor.amount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tokens × {formData.token}</span>
                      <span className="font-medium">× {formData.token}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2 mt-2">
                      <div className="flex justify-between">
                        <span className="font-semibold text-gray-900">Total Amount</span>
                        <span className="text-xl font-bold text-blue-700">₹{calculateTotal()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    File Upload Information
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Upload medical records for better consultation</li>
                    <li>• Supported: Images (JPG, PNG) & PDF files</li>
                    <li>• Max 10MB per file</li>
                    <li>• Files are encrypted and securely stored</li>
                  </ul>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <h4 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    Important Information
                  </h4>
                  <ul className="text-sm text-amber-800 space-y-1">
                    <li>• Please arrive 10 minutes before your scheduled time</li>
                    <li>• Bring your previous medical records if any</li>
                    <li>• Cancellation is free up to 24 hours before</li>
                    <li>• Consultation duration: 15-20 minutes</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HomepageBooking = ({ userId }: { userId?: number }) => {
  const { user } = useAuth();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookingModal, setBookingModal] = useState<{
    isOpen: boolean;
    doctor: any;
    selectedDate: Date;
    selectedSlot: any;
  }>({
    isOpen: false,
    doctor: null,
    selectedDate: new Date(),
    selectedSlot: null,
  });

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

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
        
        const enhancedDoctors = data.map(doctor => {
          const leaveDates = doctor.leaveDates || [];
          const weeklySchedule = doctor.weeklySchedule || {};
          const hasWeeklySchedule = Object.keys(weeklySchedule).length > 0;
          
          const futureSchedule: { [key: string]: any } = {};
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const futureDays = 60;
          
          for (let i = 0; i < futureDays; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            date.setHours(0, 0, 0, 0);
            
            const dateKey = date.toISOString().split('T')[0];
            const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
            
            let isLeaveDay = false;
            for (const leaveDateStr of leaveDates) {
              try {
                const leaveDate = new Date(leaveDateStr);
                leaveDate.setHours(0, 0, 0, 0);
                
                if (leaveDate.getTime() === date.getTime()) {
                  isLeaveDay = true;
                  break;
                }
              } catch (e) {
                console.error("Error parsing leave date:", leaveDateStr, e);
              }
            }
            
            const daySchedule = weeklySchedule?.[dayOfWeek];
            
            if (isLeaveDay) {
              futureSchedule[dateKey] = {
                enabled: false,
                slots: [],
                dayOfWeek,
                date: new Date(date),
                isLeaveDay: true,
                hasWeeklySchedule: hasWeeklySchedule,
                dayHasSchedule: !!daySchedule,
                dayEnabled: daySchedule?.enabled || false
              };
            } else if (daySchedule?.enabled && daySchedule.slots?.length > 0) {
              futureSchedule[dateKey] = {
                enabled: true,
                slots: daySchedule.slots || [],
                dayOfWeek,
                date: new Date(date),
                isLeaveDay: false,
                hasWeeklySchedule: true,
                dayHasSchedule: true,
                dayEnabled: true
              };
            } else {
              futureSchedule[dateKey] = {
                enabled: false,
                slots: [],
                dayOfWeek,
                date: new Date(date),
                isLeaveDay: false,
                hasWeeklySchedule: hasWeeklySchedule,
                dayHasSchedule: !!daySchedule,
                dayEnabled: daySchedule?.enabled || false
              };
            }
          }
          
          return {
            ...doctor,
            weeklySchedule: weeklySchedule,
            futureSchedule,
            leaveDates,
            hasWeeklySchedule: hasWeeklySchedule,
            tokenLimit: doctor.tokenLimit || null
          };
        });
        
        setDoctors(enhancedDoctors);
      } catch (err) {
        setError("Failed to load doctor schedules. Please try again.");
        console.error("Error fetching doctors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [userId]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDoctorAvailabilityForDate = (doctor: any, date: Date) => {
    const dateKey = date.toISOString().split('T')[0];
    
    if (!doctor.futureSchedule) {
      return { 
        enabled: false, 
        slots: [], 
        isLeaveDay: false, 
        hasWeeklySchedule: false,
        dayHasSchedule: false,
        dayEnabled: false 
      };
    }
    
    const schedule = doctor.futureSchedule[dateKey];
    
    if (schedule) {
      return schedule;
    }
    
    const leaveDates = doctor.leaveDates || [];
    const isLeaveDay = leaveDates.some((leaveDate: string) => {
      try {
        const leaveDateObj = new Date(leaveDate);
        leaveDateObj.setHours(0, 0, 0, 0);
        const compareDate = new Date(date);
        compareDate.setHours(0, 0, 0, 0);
        return leaveDateObj.getTime() === compareDate.getTime();
      } catch (e) {
        return false;
      }
    });
    
    return { 
      enabled: false, 
      slots: [], 
      isLeaveDay: isLeaveDay,
      hasWeeklySchedule: doctor.hasWeeklySchedule || false,
      dayHasSchedule: false,
      dayEnabled: false,
      date: date 
    };
  };

  const getNextAvailableSlot = (doctor: any) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 60; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const schedule = doctor.futureSchedule?.[dateKey];

      if (schedule?.enabled && schedule.slots?.length > 0) {
        return {
          date: schedule.date,
          time: schedule.slots[0].from,
          isToday: i === 0,
        };
      }
    }
    return null;
  };

  const getAvailableDaysCount = (doctor: any, daysRange = 30) => {
    let count = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < daysRange; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateKey = date.toISOString().split('T')[0];
      const schedule = doctor.futureSchedule?.[dateKey];

      if (schedule?.enabled && schedule.slots?.length > 0) {
        count++;
      }
    }
    return count;
  };

  const handleSlotClick = (doctor: any, date: Date, slot: any) => {
    setBookingModal({
      isOpen: true,
      doctor,
      selectedDate: date,
      selectedSlot: slot
    });
  };

  const CalendarView = ({ doctor }: { doctor: any }) => {
    const calendarDays = generateCalendar(
      currentMonth.getFullYear(),
      currentMonth.getMonth()
    );

    return (
      <div className="mt-6 border-t border-gray-100 pt-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-6 gap-4">
          <div>
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-gray-500" />
              Availability Calendar
            </h4>
            <p className="text-sm text-gray-600 mt-1">
              Select a date to see available time slots
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-green-500"></div>
                <span className="text-sm text-gray-600">Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                <span className="text-sm text-gray-600">Leave</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-red-400"></div>
                <span className="text-sm text-gray-600">Not Available</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="font-medium text-gray-900 min-w-[160px] text-center text-base">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </span>
              <button
                onClick={nextMonth}
                className="p-2.5 rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAYS_OF_WEEK.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const availability = getDoctorAvailabilityForDate(doctor, day.date);
            const isSelected = selectedDate &&
              selectedDate.toDateString() === day.date.toDateString();
            const isPastDate = day.date < new Date().setHours(0, 0, 0, 0);
            const isToday = day.isToday;

            let borderColor = 'border-gray-200';
            let bgColor = 'bg-gray-50';
            let textColor = 'text-gray-900';
            let statusLabel = '';
            let statusColor = '';

            if (availability.isLeaveDay) {
              borderColor = 'border-amber-300';
              bgColor = 'bg-amber-50';
              textColor = 'text-amber-900';
              statusLabel = 'Leave';
              statusColor = 'bg-amber-100 text-amber-800';
            } else if (availability.enabled) {
              borderColor = 'border-green-300';
              bgColor = 'bg-green-50';
              textColor = 'text-green-900';
            } else if (availability.dayHasSchedule && !availability.dayEnabled) {
              borderColor = 'border-red-300';
              bgColor = 'bg-red-50';
              textColor = 'text-red-900';
              statusLabel = 'Not Available';
              statusColor = 'bg-red-100 text-red-800';
            } else if (!availability.hasWeeklySchedule) {
              borderColor = 'border-red-300';
              bgColor = 'bg-red-50';
              textColor = 'text-red-800';
              statusLabel = 'No Schedule';
              statusColor = 'bg-red-100 text-red-800';
            } else {
              borderColor = 'border-red-200';
              bgColor = 'bg-red-50';
              textColor = 'text-red-700';
              statusLabel = 'Not Available';
              statusColor = 'bg-red-100 text-red-700';
            }

            return (
              <button
                key={index}
                onClick={() => !isPastDate && setSelectedDate(day.date)}
                disabled={isPastDate}
                className={`
                  relative min-h-[5rem] sm:min-h-[6rem] rounded-lg border p-2 flex flex-col items-center justify-center transition-all duration-200
                  ${isPastDate ? 'bg-gray-50 cursor-not-allowed opacity-60' : 'hover:shadow-md hover:-translate-y-0.5'}
                  ${!day.isCurrentMonth ? 'text-gray-400' : textColor}
                  ${borderColor} ${bgColor}
                  ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50 shadow-md' : ''}
                  ${isToday ? 'border-blue-300 bg-blue-50' : ''}
                `}
              >
                <div className="flex flex-col items-center justify-center w-full mb-1">
                  <span className={`
                    text-xl sm:text-lg font-bold mb-1
                    ${isToday ? 'bg-blue-500 text-white px-3 py-1 rounded-full w-10 h-10 flex items-center justify-center' : ''}
                  `}>
                    {day.date.getDate()}
                  </span>
                </div>

                {statusLabel && !availability.enabled && (
                  <div className={`text-xs sm:text-[11px] font-medium px-2 py-1 rounded-full mt-1 ${statusColor}`}>
                    {statusLabel}
                  </div>
                )}

                {availability.enabled && !availability.isLeaveDay && (
                  <div className="mt-2 flex flex-col items-center">
                    <div className="text-xs sm:text-[11px] font-semibold text-green-700 mb-1">
                      {availability.slots.length} slot{availability.slots.length > 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-1">
                      {[...Array(Math.min(3, availability.slots.length))].map((_, i) => (
                        <div key={i} className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      ))}
                    </div>
                  </div>
                )}

                {isPastDate && (
                  <div className="absolute inset-0 bg-gray-100/80 rounded-lg flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-500">Past</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {selectedDate && (
          <div className="mt-8 p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  Available slots for {formatDate(selectedDate)}
                </h4>
                <p className="text-sm text-gray-600">
                  {getDoctorAvailabilityForDate(doctor, selectedDate).enabled ?
                    `${getDoctorAvailabilityForDate(doctor, selectedDate).slots.length} available time slots` :
                    getDoctorAvailabilityForDate(doctor, selectedDate).isLeaveDay ?
                      'Doctor is on leave on this date' :
                      !getDoctorAvailabilityForDate(doctor, selectedDate).hasWeeklySchedule ?
                        'Doctor has no weekly schedule set' :
                        getDoctorAvailabilityForDate(doctor, selectedDate).dayHasSchedule &&
                          !getDoctorAvailabilityForDate(doctor, selectedDate).dayEnabled ?
                          'Doctor has schedule but not available on this day' :
                          'No slots available for this date'
                  }
                </p>
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 hover:bg-white rounded-lg transition-colors self-start sm:self-auto"
              >
                Clear
              </button>
            </div>

            {getDoctorAvailabilityForDate(doctor, selectedDate).enabled &&
              !getDoctorAvailabilityForDate(doctor, selectedDate).isLeaveDay && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {getDoctorAvailabilityForDate(doctor, selectedDate).slots.map((slot: any, i: number) => (
                    <button
                      key={i}
                      onClick={() => handleSlotClick(doctor, selectedDate, slot)}
                      className="group relative bg-white border border-blue-200 rounded-xl p-3 sm:p-4 text-center hover:border-blue-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-base sm:text-lg font-bold text-blue-700 mb-1">
                          {formatTime12Hour(slot.from)}
                        </div>
                        <div className="text-xs text-gray-500 mb-2">to {formatTime12Hour(slot.to)}</div>
                        {slot.token && (
                          <div className="text-xs font-medium bg-green-50 text-green-700 px-2 py-1 rounded-full">
                            Token: {slot.token}
                          </div>
                        )}
                        <div className="mt-3 w-full">
                          <div className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 group-hover:text-blue-700">
                            <span>Book Now</span>
                            <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
          </div>
        )}
      </div>
    );
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
    <>
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Calendar className="h-4 w-4" />
              Book Appointments Online
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Available Doctors for Consultation
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Select a doctor and choose your preferred date & time slot. All consultations are confirmed instantly.
            </p>
          </div>

          <div className="flex justify-center sm:justify-end mb-6">
            <div className="inline-flex bg-white border border-gray-300 rounded-lg p-1 shadow-sm">
              <button
                onClick={() => setViewMode("calendar")}
                className={`
                  px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300
                  ${viewMode === "calendar"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                Calendar View
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`
                  px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all duration-300
                  ${viewMode === "list"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                  }
                `}
              >
                List View
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-10">
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-blue-50 rounded-xl">
                  <User className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{doctors.length}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Available Doctors</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-green-50 rounded-xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {doctors.reduce((acc, doc) => acc + getAvailableDaysCount(doc, 30), 0)}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Available Days (Next 30 days)</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-purple-50 rounded-xl">
                  <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">Instant</p>
                  <p className="text-xs sm:text-sm text-gray-600">Booking Confirmation</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-amber-50 rounded-xl">
                  <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {viewMode === "calendar" ? "Calendar" : "List"}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Current View</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8">
            {doctors.map((doctor) => {
              const nextSlot = getNextAvailableSlot(doctor);
              const availableDays = getAvailableDaysCount(doctor, 30);

              return (
                <div
                  key={doctor.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-4 sm:p-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="relative self-start">
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
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg sm:text-xl">{doctor.name}</h3>
                            <p className="text-sm text-gray-600">{doctor.specialization}</p>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="text-lg font-bold text-blue-700">₹{doctor.amount}</p>
                            <p className="text-xs text-gray-500">per consultation</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                            <span className="text-xs font-medium text-gray-700 ml-1">4.8</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            <span className="font-medium">{doctor.experience || '5'}+ years</span> experience
                          </div>
                          <div className="text-xs font-medium text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                            {availableDays} days available
                          </div>
                          {doctor.leaveDates?.length > 0 && (
                            <div className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                              {doctor.leaveDates.length} leave day{doctor.leaveDates.length > 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {nextSlot && (
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-800">
                              Next available: {nextSlot.isToday ? 'Today' : formatDate(nextSlot.date)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-blue-700">
                              {formatTime12Hour(nextSlot.time)}
                            </span>
                            <button
                              onClick={() => {
                                const date = new Date(nextSlot.date);
                                setSelectedDate(date);
                                handleSlotClick(doctor, date, { from: nextSlot.time, to: "04:00PM" });
                              }}
                              className="text-xs bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {viewMode === "calendar" ? (
                    <CalendarView doctor={doctor} />
                  ) : (
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          Upcoming Availability (Next 7 Days)
                        </h4>
                        <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full self-start sm:self-auto">
                          {getAvailableDaysCount(doctor, 7)}/{7} days
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-7 gap-3">
                        {Array.from({ length: 7 }).map((_, i) => {
                          const date = new Date();
                          date.setDate(date.getDate() + i);
                          const availability = getDoctorAvailabilityForDate(doctor, date);
                          const isToday = i === 0;

                          return (
                            <div
                              key={i}
                              className={`
                                p-3 rounded-xl border flex flex-col items-center transition-all duration-200 hover:shadow-md
                                ${isToday ? 'bg-blue-50 border-blue-300' : ''}
                                ${availability.isLeaveDay ? 'bg-amber-50 border-amber-200' :
                                  availability.enabled ? 'bg-green-50 border-green-200' :
                                    !availability.hasWeeklySchedule ? 'bg-red-50 border-red-200' : 'bg-gray-50 border-gray-200'}
                              `}
                            >
                              <div className="text-xs font-medium text-gray-500">
                                {DAYS_OF_WEEK[date.getDay()]}
                              </div>
                              <div className={`
                                text-lg font-bold my-1
                                ${isToday ? 'text-blue-700' :
                                  availability.isLeaveDay ? 'text-amber-700' :
                                    availability.enabled ? 'text-green-700' :
                                      !availability.hasWeeklySchedule ? 'text-red-700' : 'text-gray-500'}
                              `}>
                                {date.getDate()}
                              </div>
                              <div className="text-[10px] text-gray-600">
                                {date.toLocaleDateString('en-US', { month: 'short' })}
                              </div>

                              {availability.isLeaveDay ? (
                                <div className="mt-2 text-center">
                                  <XCircle className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                                  <div className="text-[10px] font-medium text-amber-700">
                                    On Leave
                                  </div>
                                </div>
                              ) : availability.enabled ? (
                                <div className="mt-2 text-center">
                                  <CheckCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
                                  <div className="text-[10px] font-medium text-green-700">
                                    {availability.slots.length} slot{availability.slots.length > 1 ? 's' : ''}
                                  </div>
                                </div>
                              ) : !availability.hasWeeklySchedule ? (
                                <div className="mt-2 text-center">
                                  <XCircle className="h-4 w-4 text-red-400 mx-auto mb-1" />
                                  <div className="text-[10px] font-medium text-red-700">
                                    No Schedule
                                  </div>
                                </div>
                              ) : (
                                <XCircle className="h-4 w-4 text-gray-300 mt-2" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <button
                        onClick={() => setViewMode("calendar")}
                        className="w-full mt-6 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                      >
                        View Full Calendar & Book
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-sm text-gray-600 bg-white border border-gray-200 rounded-2xl px-4 sm:px-6 py-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
                <span>Available (has schedule & slots)</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-amber-500"></div>
                <span>On leave</span>
              </div>
              <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400"></div>
                <span>Not available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BookingModal
        isOpen={bookingModal.isOpen}
        onClose={() => setBookingModal({ ...bookingModal, isOpen: false })}
        doctor={bookingModal.doctor}
        selectedDate={bookingModal.selectedDate}
        selectedSlot={bookingModal.selectedSlot}
        user={user}
      />
    </>
  );
};

export default HomepageBooking;