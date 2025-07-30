import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { format } from "date-fns";

const Booking = () => {
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    serviceId: "",
    date: "",
    time: "",
    notes: ""
  });

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Function to check if time is in the past
  const isTimeInPast = (time: string) => {
    if (!formData.date) return false;
    const selectedDateTime = new Date(`${formData.date}T${time}:00`);
    const now = new Date();
    return selectedDateTime <= now;
  };

  // Get services from database
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await fetch("/api/services");
      if (!response.ok) throw new Error("Failed to fetch services");
      return response.json();
    }
  });

  // Get booked appointments for the selected date
  const { data: bookedAppointments } = useQuery({
    queryKey: ["/api/appointments/by-date", formData.date],
    queryFn: async () => {
      if (!formData.date) return [];
      const response = await fetch(`/api/appointments/by-date?date=${formData.date}`);
      if (!response.ok) throw new Error("Failed to fetch appointments");
      return response.json();
    },
    enabled: !!formData.date
  });

  // Function to check if time slot is booked
  const isTimeSlotBooked = (time: string) => {
    if (!bookedAppointments || !formData.date) return false;
    
    const selectedDateTime = new Date(`${formData.date}T${time}:00`);
    
    return bookedAppointments.some((appointment: any) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      // Only consider appointments that are not cancelled, completed, or deleted from admin
      return appointmentDate.getTime() === selectedDateTime.getTime() && 
             appointment.status !== 'cancelled' && 
             appointment.status !== 'completed' &&
             !appointment.isDeletedFromAdmin;
    });
  };

  // Function to get appointment status for a time slot
  const getAppointmentStatus = (time: string) => {
    if (!bookedAppointments || !formData.date) return null;
    
    const selectedDateTime = new Date(`${formData.date}T${time}:00`);
    
    const appointment = bookedAppointments.find((appointment: any) => {
      const appointmentDate = new Date(appointment.appointmentDate);
      return appointmentDate.getTime() === selectedDateTime.getTime();
    });
    
    // Return null for cancelled, completed, or deleted from admin appointments so they appear as available
    return appointment && appointment.status !== 'cancelled' && appointment.status !== 'completed' && !appointment.isDeletedFromAdmin ? appointment.status : null;
  };

  // Create appointment mutation
  const createAppointmentMutation = useMutation({
    mutationFn: async (appointmentData: any) => {
      const response = await apiRequest("POST", "/api/appointments", appointmentData);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/appointments"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/appointments/by-date"] });
      
      toast({
        title: t.success || "Success",
        description: t.appointmentCreated || "Appointment created successfully",
      });
      
      // Reset form
      setFormData({
        serviceId: "",
        date: "",
        time: "",
        notes: ""
      });
    },
    onError: (error: any) => {
      console.error("Error creating appointment:", error);
      toast({
        title: t.error || "Error",
        description: t.appointmentError || "Failed to create appointment",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast({
        title: t.error || "Error",
        description: t.loginRequired || "Login required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: t.error || "Error",
        description: t.fillAllFields || "Fill all required fields",
        variant: "destructive",
      });
      return;
    }

    // Create appointment date by combining date and time
    const appointmentDateTime = new Date(`${formData.date}T${formData.time}:00`);
    
    // Check if the selected time is in the past
    if (appointmentDateTime <= new Date()) {
      toast({
        title: t.error || "Error",
        description: t.pastTimeError || "Cannot book appointments in the past",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the time slot is already booked
    if (isTimeSlotBooked(formData.time)) {
      toast({
        title: t.error || "Error",
        description: t.timeSlotAlreadyBooked || "This time slot is already booked",
        variant: "destructive",
      });
      return;
    }
    
    // Check availability before creating appointment
    try {
      const availabilityResponse = await fetch("/api/appointments/check-availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          serviceId: parseInt(formData.serviceId),
          appointmentDate: appointmentDateTime.toISOString(),
        }),
      });

      if (!availabilityResponse.ok) {
        throw new Error("Failed to check availability");
      }

      const availabilityData = await availabilityResponse.json();
      
      if (!availabilityData.available) {
        toast({
          title: t.error || "Error",
          description: t.timeSlotUnavailable || "This time slot is unavailable",
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      console.error("Error checking availability:", error);
      toast({
        title: t.error || "Error",
        description: t.appointmentError || "Failed to check availability",
        variant: "destructive",
      });
      return;
    }
    
    const appointmentData = {
      serviceId: parseInt(formData.serviceId),
      appointmentDate: appointmentDateTime.toISOString(),
      notes: formData.notes || null,
      status: "pending"
    };

    createAppointmentMutation.mutate(appointmentData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-mystical-500 dark:text-mystical-400 mb-4">{t.bookingTitle}</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">{t.bookingDescription}</p>
        </div>

        <Card className="shadow-xl dark:shadow-mystical-500/10 bg-background dark:bg-card">
          <CardContent className="p-8 text-center">
            <p className="text-lg text-muted-foreground mb-6">
              {t.loginRequired || "Login required"}
            </p>
            <Link href="/login">
              <Button className="bg-gradient-to-r from-mystical-500 to-accent-500 text-white px-8 py-3 hover:from-mystical-600 hover:to-accent-600 shadow-lg transform hover:scale-105 transition-all font-semibold">
                {t.login || "Login"}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-3 sm:px-4 lg:px-8 py-6 sm:py-12">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl font-bold text-mystical-500 dark:text-mystical-400 mb-2 sm:mb-4">{t.bookingTitle}</h1>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm sm:text-base">{t.bookingDescription}</p>
        </div>

      <Card className="shadow-xl dark:shadow-mystical-500/10 bg-background dark:bg-card">
        <CardContent className="p-4 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection */}
            <div>
              <Label htmlFor="service" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                {t.selectService}
              </Label>
              {servicesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner size="sm" />
                </div>
              ) : (
                <Select value={formData.serviceId} onValueChange={(value) => handleInputChange("serviceId", value)}>
                  <SelectTrigger className="dark:bg-background dark:border-mystical-700">
                    <SelectValue placeholder={t.selectService} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-background dark:border-mystical-700">
                    {services?.map((service: any) => (
                      <SelectItem key={service.id} value={service.id.toString()}>
                        {String(service.name?.[language] || service.name?.ua)} - {service.price / 100} zł ({service.duration} {t.minutes})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Date and Time */}
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <Label htmlFor="date" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  {t.selectDate}
                </Label>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={"w-full justify-start text-left font-normal dark:bg-background dark:border-mystical-700" + (formData.date ? "" : " text-muted-foreground")}
                    >
                      {formData.date ? format(new Date(formData.date), "yyyy-MM-dd") : t.selectDate}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date ? new Date(formData.date) : undefined}
                      onSelect={date => {
                        if (date) handleInputChange("date", format(date, "yyyy-MM-dd"));
                        setCalendarOpen(false);
                      }}
                      disabled={date => date < new Date(new Date().setHours(0,0,0,0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label htmlFor="time" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  {t.selectTime}
                </Label>
                <Select value={formData.time} onValueChange={(value) => handleInputChange("time", value)}>
                  <SelectTrigger className="dark:bg-background dark:border-mystical-700">
                    <SelectValue placeholder={t.selectTime} />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-background dark:border-mystical-700">
                    {!isTimeInPast("09:00") && !isTimeSlotBooked("09:00") && (
                      <SelectItem value="09:00">09:00</SelectItem>
                    )}
                    {!isTimeInPast("09:00") && isTimeSlotBooked("09:00") && (
                      <SelectItem 
                        value="09:00" 
                        disabled 
                        className={getAppointmentStatus("09:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        09:00 - {getAppointmentStatus("09:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("10:00") && !isTimeSlotBooked("10:00") && (
                      <SelectItem value="10:00">10:00</SelectItem>
                    )}
                    {!isTimeInPast("10:00") && isTimeSlotBooked("10:00") && (
                      <SelectItem 
                        value="10:00" 
                        disabled 
                        className={getAppointmentStatus("10:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        10:00 - {getAppointmentStatus("10:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("11:00") && !isTimeSlotBooked("11:00") && (
                      <SelectItem value="11:00">11:00</SelectItem>
                    )}
                    {!isTimeInPast("11:00") && isTimeSlotBooked("11:00") && (
                      <SelectItem 
                        value="11:00" 
                        disabled 
                        className={getAppointmentStatus("11:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        11:00 - {getAppointmentStatus("11:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("12:00") && !isTimeSlotBooked("12:00") && (
                      <SelectItem value="12:00">12:00</SelectItem>
                    )}
                    {!isTimeInPast("12:00") && isTimeSlotBooked("12:00") && (
                      <SelectItem 
                        value="12:00" 
                        disabled 
                        className={getAppointmentStatus("12:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        12:00 - {getAppointmentStatus("12:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("13:00") && !isTimeSlotBooked("13:00") && (
                      <SelectItem value="13:00">13:00</SelectItem>
                    )}
                    {!isTimeInPast("13:00") && isTimeSlotBooked("13:00") && (
                      <SelectItem 
                        value="13:00" 
                        disabled 
                        className={getAppointmentStatus("13:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        13:00 - {getAppointmentStatus("13:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("14:00") && !isTimeSlotBooked("14:00") && (
                      <SelectItem value="14:00">14:00</SelectItem>
                    )}
                    {!isTimeInPast("14:00") && isTimeSlotBooked("14:00") && (
                      <SelectItem 
                        value="14:00" 
                        disabled 
                        className={getAppointmentStatus("14:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        14:00 - {getAppointmentStatus("14:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("15:00") && !isTimeSlotBooked("15:00") && (
                      <SelectItem value="15:00">15:00</SelectItem>
                    )}
                    {!isTimeInPast("15:00") && isTimeSlotBooked("15:00") && (
                      <SelectItem 
                        value="15:00" 
                        disabled 
                        className={getAppointmentStatus("15:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        15:00 - {getAppointmentStatus("15:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("16:00") && !isTimeSlotBooked("16:00") && (
                      <SelectItem value="16:00">16:00</SelectItem>
                    )}
                    {!isTimeInPast("16:00") && isTimeSlotBooked("16:00") && (
                      <SelectItem 
                        value="16:00" 
                        disabled 
                        className={getAppointmentStatus("16:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        16:00 - {getAppointmentStatus("16:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("17:00") && !isTimeSlotBooked("17:00") && (
                      <SelectItem value="17:00">17:00</SelectItem>
                    )}
                    {!isTimeInPast("17:00") && isTimeSlotBooked("17:00") && (
                      <SelectItem 
                        value="17:00" 
                        disabled 
                        className={getAppointmentStatus("17:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        17:00 - {getAppointmentStatus("17:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("18:00") && !isTimeSlotBooked("18:00") && (
                      <SelectItem value="18:00">18:00</SelectItem>
                    )}
                    {!isTimeInPast("18:00") && isTimeSlotBooked("18:00") && (
                      <SelectItem 
                        value="18:00" 
                        disabled 
                        className={getAppointmentStatus("18:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        18:00 - {getAppointmentStatus("18:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("19:00") && !isTimeSlotBooked("19:00") && (
                      <SelectItem value="19:00">19:00</SelectItem>
                    )}
                    {!isTimeInPast("19:00") && isTimeSlotBooked("19:00") && (
                      <SelectItem 
                        value="19:00" 
                        disabled 
                        className={getAppointmentStatus("19:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        19:00 - {getAppointmentStatus("19:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                    
                    {!isTimeInPast("20:00") && !isTimeSlotBooked("20:00") && (
                      <SelectItem value="20:00">20:00</SelectItem>
                    )}
                    {!isTimeInPast("20:00") && isTimeSlotBooked("20:00") && (
                      <SelectItem 
                        value="20:00" 
                        disabled 
                        className={getAppointmentStatus("20:00") === "confirmed" ? "text-gray-500" : "text-orange-500"}
                      >
                        20:00 - {getAppointmentStatus("20:00") === "confirmed" ? t.confirmed : t.pending}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            

            {/* Comments */}
            <div>
              <Label htmlFor="notes" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                {t.comments}
              </Label>
              <Textarea
                id="notes"
                rows={4}
                placeholder={t.commentsPlaceholder}
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="dark:bg-background dark:border-mystical-700"
              />
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <Button 
                type="submit" 
                disabled={createAppointmentMutation.isPending}
                className="bg-gradient-to-r from-mystical-500 to-accent-500 text-white px-8 py-3 hover:from-mystical-600 hover:to-accent-600 shadow-lg transform hover:scale-105 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {createAppointmentMutation.isPending ? (
                  <LoadingSpinner size="sm" text={t.processing || "Processing..."} />
                ) : (
                  t.bookAppointment || "Book appointment"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </main>
  );
};

export default Booking;
