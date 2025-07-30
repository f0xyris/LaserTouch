export type Language = 'en' | 'pl' | 'uk';

export const languageNames: Record<Language, string> = {
  en: 'English',
  pl: 'Polski',
  uk: 'Українська'
};

export interface Translations {
  // Navigation
  home: string;
  services: string;
  about: string;
  contact: string;
  portfolio: string;
  booking: string;
  training: string;
  reviews: string;
  account: string;
  admin: string;
  login: string;
  logout: string;
  loginDescription: string;
  loginWithReplit: string;
  backToHome: string;
  loginRequired: string;
  
  // Theme toggle
  toggleTheme: string;
  
  // Language selector
  language: string;
  
  // Loading states
  common: {
    loading: string;
    processing: string;
    beautyStudio: string;
  };
  
  // Home page
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  bookNow: string;
  
  // Services
  servicesTitle: string;
  servicesDescription: string;
  learnMore: string;
  laserHairRemoval: string;
  massage: string;
  spaServices: string;
  
  // Service details
  laserHairRemovalDesc: string;
  massageDesc: string;
  spaDesc: string;
  trainingDesc: string;
  priceFrom: string;
  price: string;
  
  // Features section
  whyChooseUs: string;
  modernEquipment: string;
  modernEquipmentDesc: string;
  experiencedSpecialists: string;
  experiencedSpecialistsDesc: string;
  individualApproach: string;
  individualApproachDesc: string;
  
  // About
  aboutTitle: string;
  aboutDescription: string;
  
  // Contact
  contactTitle: string;
  contactDescription: string;
  phone: string;
  email: string;
  address: string;
  
  // Portfolio
  portfolioTitle: string;
  portfolioDescription: string;
  
  // Booking
  bookingTitle: string;
  bookingDescription: string;
  selectService: string;
  selectDate: string;
  selectTime: string;
  fullName: string;
  emailAddress: string;
  phoneNumber: string;
  submit: string;
  
  // Training
  trainingTitle: string;
  trainingDescription: string;
  courses: string;
  coursesDescription: string;
  laserEpilationCourse: string;
  laserEpilationCourseDesc: string;
  massageCourse: string;
  massageCourseDesc: string;
  skinCareCourse: string;
  skinCareCourseDesc: string;
  
  // Reviews
  reviewsTitle: string;
  reviewsDescription: string;
  clientReviews: string;
  reviewAnna: string;
  reviewMaria: string;
  reviewElena: string;
  reviewOlga: string;
  reviewTatyana: string;
  reviewSvetlana: string;
  // --- Новые ключи для формы отзывов ---
  reviewFormTitle: string;
  reviewFormDescription: string;
  reviewFormNameLabel: string;
  reviewFormNamePlaceholder: string;
  reviewFormTextLabel: string;
  reviewFormTextPlaceholder: string;
  reviewFormRatingLabel: string;
  reviewFormSubmit: string;
  reviewFormSubmitting: string;
  reviewFormPending: string;
  reviewFormAnonymous: string;
  reviewApprove: string;
  reviewApproving: string;
  reviewReject: string;
  reviewRejecting: string;
  reviewStatusPending: string;
  reviewStatusPublished: string;
  reviewStatusRejected: string;
  reviewDelete: string;
  reviewDeleting: string;
  reviewDeleteConfirm: string;
  
  // Account
  accountTitle: string;
  personalAccount: string;
  
  // Admin
  adminTitle: string;
  adminPanel: string;
  
  // Additional pages content
  welcomeMessage: string;
  pageUnderConstruction: string;
  myAppointments: string;
  profileSettings: string;
  bookingHistory: string;
  dashboard: string;
  manageBookings: string;
  manageUsers: string;
  viewReports: string;
  
  // Hero slides
  slide1Title: string;
  slide1Subtitle: string;
  slide1Description: string;
  slide2Title: string;
  slide2Subtitle: string;
  slide2Description: string;
  slide3Title: string;
  slide3Subtitle: string;
  slide3Description: string;
  
  // Staff members (titles and descriptions)
  seniorMaster: string;
  massageTherapist: string;
  cosmetologist: string;
  trainingSpecialist: string;
  administrator: string;
  laserEpilationSpec: string;
  classicSpaSpec: string;
  facialBodyCareSpec: string;
  coursesWorkshopsSpec: string;
  consultationBookingSpec: string;
  experienceYears: string;
  certifiedSpecialistTitle: string;
  clientsCount: string;
  diplomaMassage: string;
  specialistYear: string;
  careExpert: string;
  internationalCert: string;
  topTrainer: string;
  graduatesCount: string;
  bestService: string;
  clientOriented: string;
  
  // Footer
  footerDescription: string;
  followUs: string;
  quickLinks: string;
  contactInfo: string;
  allRightsReserved: string;
  workingHours: string;
  
  // Common
  loading: string;
  error: string;
  success: string;
  close: string;
  save: string;
  cancel: string;
  confirm: string;
  duration: string;
  minutes: string;
  buy: string;
  hours: string;
  
  // Staff section
  ourTeam: string;
  ourTeamDescription: string;
  yearsExperience: string;
  rating: string;
  certifiedSpecialist: string;
  clients: string;
  
  // Staff names
  kseniaNovak: string;
  
  // Location section  
  howToFindUs: string;
  locationDescription: string;
  openInMaps: string;
  
  // Booking form
  name: string;
  namePlaceholder: string;
  phonePlaceholder: string;
  comments: string;
  commentsPlaceholder: string;
  bookAppointment: string;
  
  // Course checkout
  backToCourses: string;
  courseDetails: string;
  payment: string;
  paymentError: string;
  paymentSuccess: string;
  paymentSuccessMessage: string;
  processing: string;
  payAmount: string;
  courseNotFound: string;
  returnToCourses: string;
  cost: string;
  
  // Authentication
  auth: {
    welcome: string;
    subtitle: string;
    login: string;
    register: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    emailPlaceholder: string;
    passwordPlaceholder: string;
    firstNamePlaceholder: string;
    lastNamePlaceholder: string;
    phonePlaceholder: string;
    loggingIn: string;
    registering: string;
    or: string;
    googleLogin: string;
    heroDescription: string;
    emailRequired: string;
    passwordRequired: string;
    firstNameRequired: string;
    lastNameRequired: string;
    phoneRequired: string;
    emailInvalid: string;
    passwordMinLength: string;
    oauthError: string;
    oauthErrorMessage: string;
    googleTemporaryDisabled: string;
    googleTemporaryDisabledMessage: string;
    loginWelcomeCreative: string;
    loginWelcomeTitle: string;
  };
  reviewDeleted: string;
  reviewDeleteError: string;
  adminStatusUpdated: string;
  adminStatusUpdateFailed: string;
  appointmentCreated: string;
  appointmentError: string;
  fillAllFields: string;
  reviewsTab: string;
  pricesTab: string;
  appointment: string;
  appointments: string;
  calendar: string;
  date: string;
  forDate: string;
  unknownClient: string;
  clientWithoutAccount: string;
  user: string;
  role: string;
  adminAccess: string;
  searchUsers: string;
  noUsersFound: string;
  noAppointments: string;
  noAppointmentsThisDay: string;
  completed: string;
  deleted: string;
  unauthorized: string;
  accessDenied: string;
  adminAccessRequired: string;
  errorLoadingUsers: string;
  firstName: string;
  lastName: string;
  confirmed: string;
  pending: string;
  approved: string;
  rejected: string;
  cancelled: string;
  add: string;
  create: string;
  delete: string;
  deleteConfirm: string;
  deleteWarning: string;
  editPricesDesc: string;
  moderationReviewsDesc: string;
  courseName: string;
  courseDescription: string;
  serviceName: string;
  addCourse: string;
  addService: string;
  loadingReviews: string;
  noReviews: string;
  saving: string;
  added: string;
  saveError: string;
  deleteError: string;
  addError: string;
  uploadError: string;
  service: string;
  appointmentsFor: string;
  calendarDesc: string;
  userManagement: string;
  totalUsers: string;
  regularUsers: string;
  confirmAppointment: string;
  rejectAppointment: string;
  completeAppointment: string;
  cancelAppointment: string;
  appointmentConfirmed: string;
  appointmentRejected: string;
  appointmentCompleted: string;
  appointmentCancelled: string;
  confirmAppointmentMessage: string;
  rejectAppointmentMessage: string;
  completeAppointmentMessage: string;
  cancelAppointmentMessage: string;
  appointmentStatusUpdated: string;
  appointmentStatusUpdateFailed: string;
  timeSlotUnavailable: string;
  timeSlotAvailable: string;
  pastTimeError: string;
  timeSlotAlreadyBooked: string;
  deleteAppointment: string;
  deleteAppointmentConfirm: string;
  appointmentDeleted: string;
  appointmentDeleteError: string;
  deleting: string;
  
  // Delete dialogs
  deleteCourse: string;
  deleteCourseConfirm: string;
  deleteService: string;
  deleteServiceConfirm: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    home: "Home",
    services: "Services",
    about: "About",
    contact: "Contact",
    portfolio: "Portfolio",
    booking: "Booking",
    training: "Training",
    reviews: "Reviews",
    account: "Account",
    admin: "Admin",
    login: "Login",
    logout: "Logout",
    loginDescription: "Login to access your personal dashboard",
    loginWithReplit: "Login with Replit",
    backToHome: "Back to Home",
    loginRequired: "To book an appointment, you need to log in",
    toggleTheme: "Toggle theme",
    language: "Language",
    common: {
      loading: "Loading...",
      processing: "Processing...",
      beautyStudio: "Beauty Studio",
    },
    heroTitle: "Professional Laser Hair Removal & Massage",
    heroSubtitle: "Experience the ultimate in beauty and wellness",
    heroDescription: "Transform your skin with our state-of-the-art laser treatments and rejuvenating massage therapy. Book your appointment today.",
    bookNow: "Book Now",
    servicesTitle: "Our Services",
    servicesDescription: "Discover our comprehensive range of beauty and wellness treatments",
    learnMore: "Learn More",
    laserHairRemoval: "Laser Hair Removal",
    massage: "Massage",
    spaServices: "Spa Services",
    laserHairRemovalDesc: "Painless removal of unwanted hair using modern equipment",
    massageDesc: "Professional massage techniques for health and relaxation",
    spaDesc: "Premium spa treatments in a comfortable atmosphere",
    trainingDesc: "Professional courses for beauty industry specialists",
    priceFrom: "from",
    price: "Price",
    whyChooseUs: "Why Choose Us",
    modernEquipment: "Modern Equipment",
    modernEquipmentDesc: "We use only certified European equipment",
    experiencedSpecialists: "Experienced Specialists",
    experiencedSpecialistsDesc: "Team of certified masters with years of experience",
    individualApproach: "Individual Approach",
    individualApproachDesc: "Personal program for each client",
    aboutTitle: "About Us",
    aboutDescription: "We are dedicated to providing exceptional beauty and wellness services in a comfortable and professional environment.",
    contactTitle: "Contact Us",
    contactDescription: "Get in touch with us to schedule your appointment or ask any questions.",
    phone: "Phone",
    email: "Email",
    address: "Address",
    portfolioTitle: "Our Work",
    portfolioDescription: "See the amazing results our clients have achieved with our treatments.",
    bookingTitle: "Book Appointment",
    bookingDescription: "Schedule your visit to our beauty salon",
    selectService: "Select Service",
    selectDate: "Select Date",
    selectTime: "Select Time",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    submit: "Submit",
    trainingTitle: "Training & Education",
    trainingDescription: "Professional courses and certifications in beauty treatments",
    courses: "Courses",
    coursesDescription: "Learn from experienced professionals",
    reviewsTitle: "Client Reviews",
    reviewsDescription: "What our clients say about our services",
    clientReviews: "Reviews",
    reviewAnna: "Excellent salon! Professional staff, modern equipment. Laser hair removal results exceeded all expectations.",
    reviewMaria: "The massage is simply magical! The therapist took into account all my wishes. Very relaxing atmosphere. Will definitely come again.",
    reviewElena: "Great service and individual approach. Reasonable prices and high quality. Recommend to all friends!",
    reviewOlga: "Cozy atmosphere, cleanliness and professionalism. Spa treatments are simply delightful. I feel renewed!",
    reviewTatyana: "Signed up for a massage training course. Very experienced instructor, material is presented clearly. Very satisfied!",
    reviewSvetlana: "Everything is very professionally organized. Convenient online booking, reminders. Attentive and polite staff.",
    accountTitle: "Personal Account",
    personalAccount: "Account",
    adminTitle: "Admin Panel",
    adminPanel: "Administration",
    welcomeMessage: "Welcome to LaserTouch Beauty Salon",
    pageUnderConstruction: "This page is under construction",
    myAppointments: "My Appointments",
    profileSettings: "Profile Settings",
    bookingHistory: "Booking History",
    dashboard: "Dashboard",
    manageBookings: "Manage Bookings",
    manageUsers: "Manage Users",
    viewReports: "View Reports",
    slide1Title: "Professional Laser Hair Removal",
    slide1Subtitle: "Experience the ultimate in beauty treatments",
    slide1Description: "Advanced laser technology for permanent hair removal with minimal discomfort",
    slide2Title: "Relaxing Massage Therapy",
    slide2Subtitle: "Rejuvenate your body and mind",
    slide2Description: "Professional massage techniques for health, wellness and deep relaxation",
    slide3Title: "Luxurious Spa Services",
    slide3Subtitle: "Indulge in premium treatments",
    slide3Description: "Complete spa experience with facial care and body treatments",
    seniorMaster: "Senior Master",
    massageTherapist: "Massage Therapist",
    cosmetologist: "Cosmetologist",
    trainingSpecialist: "Training Specialist",
    administrator: "Administrator",
    laserEpilationSpec: "Laser Hair Removal",
    classicSpaSpec: "Classic & Spa Massage",
    facialBodyCareSpec: "Facial & Body Care",
    coursesWorkshopsSpec: "Courses & Workshops",
    consultationBookingSpec: "Consultation & Booking",
    experienceYears: "years of experience",
    certifiedSpecialistTitle: "Certified Specialist",
    clientsCount: "clients",
    diplomaMassage: "Massage Diploma",
    specialistYear: "Specialist of the Year 2023",
    careExpert: "Care Expert",
    internationalCert: "International Certificate",
    topTrainer: "Top Trainer",
    graduatesCount: "graduates",
    bestService: "Best Service",
    clientOriented: "Client Oriented",
    footerDescription: "Your premier destination for professional laser hair removal and massage therapy.",
    followUs: "Follow Us",
    quickLinks: "Quick Links",
    contactInfo: "Contact Info",
    allRightsReserved: "All rights reserved.",
    workingHours: "Mon-Sun: 9:00 - 21:00",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    close: "Close",
    save: "Save",
    cancel: "Cancel",
    confirm: "Confirm",
    duration: "Duration",
    minutes: "min",
    buy: "Buy",
    hours: "hours",
    ourTeam: "Our Team of Professionals",
    ourTeamDescription: "Meet our certified specialists with years of experience",
    yearsExperience: "years of experience",
    rating: "Rating",
    certifiedSpecialist: "Certified Specialist",
    clients: "clients",
    kseniaNovak: "Ksenia Gordienko",
    howToFindUs: "How to Find Us",
    locationDescription: "We are located in a convenient place with excellent transport accessibility",
    openInMaps: "Open in Maps",
    name: "Name",
    namePlaceholder: "Your name",
    phonePlaceholder: "+48 (___) ___-__-__",
    comments: "Comments",
    commentsPlaceholder: "Additional wishes or questions",
    bookAppointment: "Book Appointment",
    backToCourses: "Back to Courses",
    courseDetails: "Course Details",
    payment: "Payment",
    paymentError: "Payment Error",
    paymentSuccess: "Payment Successful!",
    paymentSuccessMessage: "Thank you for purchasing the course!",
    processing: "Processing...",
    payAmount: "Pay",
    courseNotFound: "Course not found",
    returnToCourses: "Return to Courses",
    cost: "Cost",
    auth: {
      welcome: "Welcome to LaserTouch",
      subtitle: "Log in or create an account to book appointments",
      login: "Login",
      register: "Register",
      email: "Email",
      password: "Password",
      firstName: "First Name",
      lastName: "Last Name",
      phone: "Phone Number",
      emailPlaceholder: "Enter your email",
      passwordPlaceholder: "Enter your password",
      firstNamePlaceholder: "Enter first name",
      lastNamePlaceholder: "Enter last name",
      phonePlaceholder: "+48 (___) ___-__-__",
      loggingIn: "Logging in...",
      registering: "Registering...",
      or: "or",
      googleLogin: "Login with Google",
      heroDescription: "Professional beauty services in the heart of Warsaw. Laser, massage, spa and training.",
      emailRequired: "Email is required",
      passwordRequired: "Password is required",
      firstNameRequired: "First name is required",
      lastNameRequired: "Last name is required",
      phoneRequired: "Phone number is required",
      emailInvalid: "Please enter a valid email address",
      passwordMinLength: "Password must be at least 6 characters",
      oauthError: "OAuth Error",
      oauthErrorMessage: "Google login failed. Please try email/password login.",
      googleTemporaryDisabled: "Google Login Temporarily Disabled",
      googleTemporaryDisabledMessage: "Please use email/password login while we fix Google OAuth issues.",
      loginWelcomeCreative: "You look amazing today! Glad to see you again!",
      loginWelcomeTitle: "Welcome back!"
    },
    laserEpilationCourse: "Laser Hair Removal Course",
    laserEpilationCourseDesc: "Professional laser hair removal training",
    massageCourse: "Massage Course",
    massageCourseDesc: "Professional massage therapy training",
    skinCareCourse: "Skin Care Course",
    skinCareCourseDesc: "Professional skin care training",
    // --- Новые ключи ---
    reviewFormTitle: "Leave your review",
    reviewFormDescription: "Share your opinion about our center. Your review will appear after moderation.",
    reviewFormNameLabel: "Your name (optional)",
    reviewFormNamePlaceholder: "Anonymous",
    reviewFormTextLabel: "Your review",
    reviewFormTextPlaceholder: "Write your review...",
    reviewFormRatingLabel: "Your rating",
    reviewFormSubmit: "Submit review",
    reviewFormSubmitting: "Submitting...",
    reviewFormPending: "Review pending moderation",
    reviewFormAnonymous: "Anonymous",
    reviewApprove: "Approve",
    reviewApproving: "Approving...",
    reviewReject: "Reject",
    reviewRejecting: "Rejecting...",
    reviewStatusPending: "Pending",
    reviewStatusPublished: "Published",
    reviewStatusRejected: "Rejected",
    reviewDelete: "Delete",
    reviewDeleting: "Deleting...",
    reviewDeleteConfirm: "Are you sure you want to delete this review?",
    reviewDeleted: "Review deleted successfully!",
    reviewDeleteError: "Failed to delete review.",
    adminStatusUpdated: "Admin status updated",
    adminStatusUpdateFailed: "Failed to update admin status",
    appointmentCreated: "Appointment created successfully",
    appointmentError: "Failed to create appointment",
    fillAllFields: "Fill all required fields",
    reviewsTab: "Client reviews",
    pricesTab: "Prices & duration",
    appointment: "Appointment",
    appointments: "Appointments",
    calendar: "Calendar",
    date: "Date",
    forDate: "For date",
    unknownClient: "Unknown Client",
    clientWithoutAccount: "Client without account",
    user: "User",
    role: "Role",
    adminAccess: "Admin access",
    searchUsers: "Search users...",
    noUsersFound: "No users found",
    noAppointments: "No appointments",
    noAppointmentsThisDay: "No appointments for this day",
    completed: "Completed",
    confirmed: "Confirmed",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
    add: "Add",
    create: "Create",
    delete: "Delete",
    deleteConfirm: "Delete this item?",
    deleteWarning: "This action cannot be undone.",
    editPricesDesc: "Edit prices and durations for courses and procedures",
    moderationReviewsDesc: "Moderation of user reviews",
    courseName: "Course name",
    courseDescription: "Course description",
    serviceName: "Service name",
    addCourse: "Add course",
    addService: "Add service",
    loadingReviews: "Loading reviews...",
    noReviews: "No reviews",
    saving: "Saving...",
    added: "Added",
    deleted: "Deleted",
    saveError: "Error saving",
    deleteError: "Error deleting",
    addError: "Error adding",
    uploadError: "Error uploading image",
    service: "Service",
    appointmentsFor: "Appointments on",
    calendarDesc: "View and manage all appointments by date",
    userManagement: "User management",
    totalUsers: "Total users",
    regularUsers: "Regular users",
    unauthorized: "Unauthorized",
    accessDenied: "Access denied",
    adminAccessRequired: "Admin access required",
    errorLoadingUsers: "Failed to load users",
    firstName: "First Name",
    lastName: "Last Name",
    confirmAppointment: "Confirm Appointment",
    rejectAppointment: "Reject Appointment",
    completeAppointment: "Complete Appointment",
    cancelAppointment: "Cancel Appointment",
    appointmentConfirmed: "Appointment confirmed",
    appointmentRejected: "Appointment rejected",
    appointmentCompleted: "Appointment completed",
    appointmentCancelled: "Appointment cancelled",
    confirmAppointmentMessage: "Are you sure you want to confirm this appointment?",
    rejectAppointmentMessage: "Are you sure you want to reject this appointment?",
    completeAppointmentMessage: "Are you sure you want to complete this appointment?",
    cancelAppointmentMessage: "Are you sure you want to cancel this appointment?",
    appointmentStatusUpdated: "Appointment status updated",
    appointmentStatusUpdateFailed: "Failed to update appointment status",
    timeSlotUnavailable: "This time slot is unavailable",
    timeSlotAvailable: "Time slot is available",
    pastTimeError: "Cannot book appointments in the past",
    timeSlotAlreadyBooked: "This time slot is already booked",
    deleteAppointment: "Delete Appointment",
    deleteAppointmentConfirm: "Are you sure you want to remove this appointment from the admin panel? (It will remain visible in user accounts)",
    appointmentDeleted: "Appointment removed from admin panel",
    appointmentDeleteError: "Failed to delete appointment",
    deleting: "Deleting...",
    
    // Delete dialogs
    deleteCourse: "Delete Course",
    deleteCourseConfirm: "Are you sure you want to delete this course? This action cannot be undone.",
    deleteService: "Delete Service",
    deleteServiceConfirm: "Are you sure you want to delete this service? This action cannot be undone."
  },
  
  pl: {
    home: "Strona główna",
    services: "Usługi",
    about: "O nas",
    contact: "Kontakt",
    portfolio: "Portfolio",
    booking: "Rezerwacja",
    training: "Szkolenia",
    reviews: "Opinie",
    account: "Konto",
    admin: "Administrator",
    login: "Logowanie",
    logout: "Wyloguj",
    loginDescription: "Zaloguj się, aby uzyskać dostęp do swojego panelu",
    loginWithReplit: "Zaloguj się przez Replit",
    backToHome: "Wróć do strony głównej",
    loginRequired: "Aby umówić się na wizytę, musisz się zalogować",
    toggleTheme: "Przełącz motyw",
    language: "Język",
    common: {
      loading: "Ładowanie...",
      processing: "Przetwarzanie...",
      beautyStudio: "Studio Piękna",
    },
    heroTitle: "Profesjonalna depilacja laserowa i masaż",
    heroSubtitle: "Doświadcz najwyższego poziomu urody i wellness",
    heroDescription: "Odmień swoją skórę dzięki naszym najnowocześniejszym zabiegom laserowym i regenerującym masażom. Umów się na wizytę już dziś.",
    bookNow: "Umów się",
    servicesTitle: "Nasze usługi",
    servicesDescription: "Odkryj nasz kompleksowy zakres zabiegów kosmetycznych i wellness",
    learnMore: "Dowiedz się więcej",
    laserHairRemoval: "Depilacja laserowa",
    massage: "Masaż",
    spaServices: "Usługi spa",
    laserHairRemovalDesc: "Bezbolesne usuwanie niechcianych włosów nowoczesnym sprzętem",
    massageDesc: "Profesjonalne techniki masażu dla zdrowia i relaksu",
    spaDesc: "Luksusowe zabiegi spa w komfortowej atmosferze",
    trainingDesc: "Profesjonalne kursy dla specjalistów branży kosmetycznej",
    priceFrom: "od",
    price: "Cena",
    whyChooseUs: "Dlaczego my",
    modernEquipment: "Nowoczesne wyposażenie",
    modernEquipmentDesc: "Używamy wyłącznie certyfikowanego sprzętu europejskiego",
    experiencedSpecialists: "Doświadczeni specjaliści",
    experiencedSpecialistsDesc: "Zespół certyfikowanych mistrzów z wieloletnim doświadczeniem",
    individualApproach: "Indywidualne podejście",
    individualApproachDesc: "Personalny program dla każdego klienta",
    aboutTitle: "O nas",
    aboutDescription: "Jesteśmy dedykowani do zapewnienia wyjątkowych usług kosmetycznych i wellness w komfortowym i profesjonalnym środowisku.",
    contactTitle: "Kontakt",
    contactDescription: "Skontaktuj się z nami, aby umówić wizytę lub zadać pytania.",
    phone: "Telefon",
    email: "Email",
    address: "Adres",
    portfolioTitle: "Nasza praca",
    portfolioDescription: "Zobacz niesamowite rezultaty, jakie osiągnęli nasi klienci dzięki naszym zabiegom.",
    bookingTitle: "Umów wizytę",
    bookingDescription: "Zaplanuj swoją wizytę w naszym salonie kosmetycznym",
    selectService: "Wybierz usługę",
    selectDate: "Wybierz datę",
    selectTime: "Wybierz godzinę",
    fullName: "Imię i nazwisko",
    emailAddress: "Adres email",
    phoneNumber: "Numer telefonu",
    submit: "Wyślij",
    trainingTitle: "Szkolenia i edukacja",
    trainingDescription: "Profesjonalne kursy i certyfikaty w zakresie zabiegów kosmetycznych",
    courses: "Kursy",
    coursesDescription: "Ucz się od doświadczonych profesjonalistów",
    reviewsTitle: "Opinie klientów",
    reviewsDescription: "Co mówią o naszych usługach nasi klienci",
    clientReviews: "Opinie",
    reviewAnna: "Świetny salon! Profesjonalna obsługa, nowoczesny sprzęt. Efekty depilacji laserowej przerosły oczekiwania.",
    reviewMaria: "Masaż jest po prostu magiczny! Terapeuta uwzględnił wszystkie moje życzenia. Bardzo relaksująca atmosfera. Na pewno wrócę.",
    reviewElena: "Świetna obsługa i indywidualne podejście. Rozsądne ceny i wysoka jakość. Polecam wszystkim znajomym!",
    reviewOlga: "Przytulna atmosfera, czystość i profesjonalizm. Zabiegi spa są po prostu zachwycające. Czuję się odnowiona!",
    reviewTatyana: "Zapisałam się na kurs masażu. Bardzo doświadczony instruktor, materiał przedstawiony jasno. Bardzo zadowolona!",
    reviewSvetlana: "Wszystko jest bardzo profesjonalnie zorganizowane. Wygodna rezerwacja online, przypomnienia. Uważny i uprzejmy personel.",
    accountTitle: "Konto osobiste",
    personalAccount: "Konto",
    adminTitle: "Panel administracyjny",
    adminPanel: "Administracja",
    welcomeMessage: "Witamy w salonie piękności LaserTouch",
    pageUnderConstruction: "Ta strona jest w budowie",
    myAppointments: "Moje wizyty",
    profileSettings: "Ustawienia profilu",
    bookingHistory: "Historia rezerwacji",
    dashboard: "Panel główny",
    manageBookings: "Zarządzaj rezerwacjami",
    manageUsers: "Zarządzaj użytkownikami",
    viewReports: "Wyświetl raporty",
    slide1Title: "Profesjonalna depilacja laserowa",
    slide1Subtitle: "Doświadcz najwyższego poziomu zabiegów kosmetycznych",
    slide1Description: "Zaawansowana technologia laserowa do trwałego usuwania włosów z minimalnym dyskomfortem",
    slide2Title: "Relaksujący masaż terapeutyczny",
    slide2Subtitle: "Odmłodź swoje ciało i umysł",
    slide2Description: "Profesjonalne techniki masażu dla zdrowia, dobrego samopoczucia i głębokiego relaksu",
    slide3Title: "Luksusowe usługi spa",
    slide3Subtitle: "Ciesz się premium zabiegami",
    slide3Description: "Kompleksowe doświadczenie spa z pielęgnacją twarzy i zabiegami na ciało",
    seniorMaster: "Starszy mistrz",
    massageTherapist: "Masażysta",
    cosmetologist: "Kosmetolog",
    trainingSpecialist: "Specjalista ds. szkoleń",
    administrator: "Administrator",
    laserEpilationSpec: "Depilacja laserowa",
    classicSpaSpec: "Klasyczny i spa masaż",
    facialBodyCareSpec: "Pielęgnacja twarzy i ciała",
    coursesWorkshopsSpec: "Kursy i warsztaty",
    consultationBookingSpec: "Konsultacje i rezerwacje",
    experienceYears: "lat doświadczenia",
    certifiedSpecialistTitle: "Certyfikowany specjalista",
    clientsCount: "klientów",
    diplomaMassage: "Dyplom masażu",
    specialistYear: "Specjalista roku 2023",
    careExpert: "Ekspert pielęgnacji",
    internationalCert: "Certyfikat międzynarodowy",
    topTrainer: "Top trener",
    graduatesCount: "absolwentów",
    bestService: "Najlepszy serwis",
    clientOriented: "Zorientowany na klienta",
    footerDescription: "Twoje główne miejsce docelowe dla profesjonalnej depilacji laserowej i masażu.",
    followUs: "Śledź nas",
    quickLinks: "Szybkie linki",
    contactInfo: "Informacje kontaktowe",
    allRightsReserved: "Wszelkie prawa zastrzeżone.",
    workingHours: "Pon-Ndz: 9:00 - 21:00",
    loading: "Ładowanie...",
    error: "Błąd",
    success: "Sukces",
    close: "Zamknij",
    save: "Zapisz",
    cancel: "Anuluj",
    confirm: "Potwierdź",
    duration: "Czas trwania",
    minutes: "min",
    buy: "Kup",
    hours: "godzin",
    ourTeam: "Nasza zespół profesjonalistów",
    ourTeamDescription: "Poznaj naszych certyfikowanych specjalistów z wieloletnim doświadczeniem",
    yearsExperience: "lat doświadczenia",
    rating: "Ocena",
    certifiedSpecialist: "Certyfikowany specjalista",
    clients: "klientów",
    kseniaNovak: "Ксения Гордиенко",
    howToFindUs: "Jak nas znaleźć",
    locationDescription: "Znajdujemy się w dogodnym miejscu z doskonałą dostępnością komunikacyjną",
    openInMaps: "Otwórz w mapach",
    name: "Imię",
    namePlaceholder: "Twoje imię",
    phonePlaceholder: "+48 (___) ___-__-__",
    comments: "Komentarz",
    commentsPlaceholder: "Dodatkowe życzenia lub pytania",
    bookAppointment: "Umów wizytę",
    backToCourses: "Wróć do kursów",
    courseDetails: "Szczegóły kursu",
    payment: "Płatność",
    paymentError: "Błąd płatności",
    paymentSuccess: "Płatność zakończona sukcesem!",
    paymentSuccessMessage: "Dziękujemy za zakup kursu!",
    processing: "Przetwarzanie...",
    payAmount: "Zapłać",
    courseNotFound: "Kurs nie znaleziony",
    returnToCourses: "Wróć do kursów",
    cost: "Koszt",
    auth: {
      welcome: "Witaj w LaserTouch",
      subtitle: "Zaloguj się lub załóż konto, aby zarezerwować wizyty",
      login: "Zaloguj",
      register: "Zarejestruj",
      email: "Email",
      password: "Hasło",
      firstName: "Imię",
      lastName: "Nazwisko",
      phone: "Numer telefonu",
      emailPlaceholder: "Wprowadź email",
      passwordPlaceholder: "Wprowadź hasło",
      firstNamePlaceholder: "Wprowadź imię",
      lastNamePlaceholder: "Wprowadź nazwisko",
      phonePlaceholder: "+48 (___) ___-__-__",
      loggingIn: "Logowanie...",
      registering: "Rejestrowanie...",
      or: "lub",
      googleLogin: "Zaloguj przez Google",
      heroDescription: "Profesjonalne usługi kosmetyczne w centrum Warszawy. Laser, masaż, spa i szkolenia.",
      emailRequired: "Email jest wymagany",
      passwordRequired: "Hasło jest wymagane",
      firstNameRequired: "Imię jest wymagane",
      lastNameRequired: "Nazwisko jest wymagane",
      phoneRequired: "Numer telefonu jest wymagany",
      emailInvalid: "Wprowadź poprawny adres email",
      passwordMinLength: "Hasło musi mieć co najmniej 6 znaków",
      oauthError: "Błąd OAuth",
      oauthErrorMessage: "Logowanie przez Google nie powiodło się. Spróbuj zalogować się emailem/hasłem.",
      googleTemporaryDisabled: "Logowanie przez Google tymczasowo wyłączone",
      googleTemporaryDisabledMessage: "Proszę użyć logowania email/hasło podczas gdy naprawiamy problemy z Google OAuth.",
      loginWelcomeCreative: "Wyglądasz dziś świetnie! Miło Cię znowu widzieć!",
      loginWelcomeTitle: "Witamy ponownie!"
    },
    laserEpilationCourse: "Kurs depilacji laserowej",
    laserEpilationCourseDesc: "Profesjonalne szkolenie z depilacji laserowej",
    massageCourse: "Kurs masażu",
    massageCourseDesc: "Profesjonalne szkolenie z masażu",
    skinCareCourse: "Kurs pielęgnacji skóry",
    skinCareCourseDesc: "Profesjonalne szkolenie z pielęgnacji skóry",
    // --- Новые ключи ---
    reviewFormTitle: "Zostaw swoją opinię",
    reviewFormDescription: "Podziel się swoją opinią o naszym centrum. Twoja opinia pojawi się po moderacji.",
    reviewFormNameLabel: "Twoje imię (opcjonalnie)",
    reviewFormNamePlaceholder: "Anonimowo",
    reviewFormTextLabel: "Twoja opinia",
    reviewFormTextPlaceholder: "Napisz swoją opinię...",
    reviewFormRatingLabel: "Twoja ocena",
    reviewFormSubmit: "Wyślij opinię",
    reviewFormSubmitting: "Wysyłanie...",
    reviewFormPending: "Opinia oczekuje na moderację",
    reviewFormAnonymous: "Anonimowo",
    reviewApprove: "Zatwierdź",
    reviewApproving: "Zatwierdzanie...",
    reviewReject: "Odrzuć",
    reviewRejecting: "Odrzucanie...",
    reviewStatusPending: "Oczekuje",
    reviewStatusPublished: "Opublikowano",
    reviewStatusRejected: "Odrzucono",
    reviewDelete: "Usuń",
    reviewDeleting: "Usuwanie...",
    reviewDeleteConfirm: "Czy na pewno chcesz usunąć tę opinię?",
    reviewDeleted: "Opinia została usunięta!",
    reviewDeleteError: "Nie udało się usunąć opinii.",
    adminStatusUpdated: "Статус адміністратора оновлено",
    adminStatusUpdateFailed: "Не вдалося оновити статус адміністратора",
    appointmentCreated: "Запис успішно створено",
    appointmentError: "Не вдалося створити запис",
    fillAllFields: "Заповніть всі обов'язкові поля",
    reviewsTab: "Opinie klientów",
    pricesTab: "Ceny i czas trwania",
    appointment: "Wizyta",
    appointments: "Wizyty",
    calendar: "Kalendarz",
    date: "Data",
    forDate: "Na datę",
    unknownClient: "Nieznany klient",
    clientWithoutAccount: "Klient bez konta",
    user: "Użytkownik",
    role: "Rola",
    adminAccess: "Dostęp administratora",
    searchUsers: "Szukaj użytkowników...",
    noUsersFound: "Nie znaleziono użytkowników",
    noAppointments: "Brak wizyt",
    noAppointmentsThisDay: "Brak wizyt w tym dniu",
    completed: "Zakończone",
    confirmed: "Potwierdzone",
    pending: "Oczekujące",
    approved: "Zatwierdzone",
    rejected: "Odrzucone",
    cancelled: "Anulowane",
    add: "Dodaj",
    create: "Utwórz",
    delete: "Usuń",
    deleteConfirm: "Usunąć ten element?",
    deleteWarning: "Tej akcji nie można cofnąć.",
    editPricesDesc: "Edytuj ceny i czas trwania kursów i zabiegów",
    moderationReviewsDesc: "Moderacja opinii użytkowników",
    courseName: "Nazwa kursu",
    courseDescription: "Opis kursu",
    serviceName: "Nazwa usługi",
    addCourse: "Dodaj kurs",
    addService: "Dodaj usługę",
    loadingReviews: "Ładowanie opinii...",
    noReviews: "Brak opinii",
    saving: "Zapisywanie...",
    added: "Dodano",
    deleted: "Usunięto",
    saveError: "Błąd zapisu",
    deleteError: "Błąd usuwania",
    addError: "Błąd dodawania",
    uploadError: "Błąd przesyłania obrazu",
    service: "Usługa",
    appointmentsFor: "Wizyty dnia",
    calendarDesc: "Przeglądaj i zarządzaj wszystkimi wizytami według daty",
    userManagement: "Zarządzanie użytkownikami",
    totalUsers: "Łącznie użytkowników",
    regularUsers: "Zwykli użytkownicy",
    unauthorized: "Nieautoryzowany",
    accessDenied: "Dostęp zabroniony",
    adminAccessRequired: "Wymagany dostęp administratora",
    errorLoadingUsers: "Błąd ładowania użytkowników",
    firstName: "Imię",
    lastName: "Nazwisko",
    confirmAppointment: "Potwierdź wizytę",
    rejectAppointment: "Odrzuć wizytę",
    completeAppointment: "Zakończ wizytę",
    cancelAppointment: "Anuluj wizytę",
    appointmentConfirmed: "Wizyta potwierdzona",
    appointmentRejected: "Wizyta odrzucona",
    appointmentCompleted: "Wizyta zakończona",
    appointmentCancelled: "Wizyta anulowana",
    confirmAppointmentMessage: "Czy na pewno chcesz potwierdzić tę wizytę?",
    rejectAppointmentMessage: "Czy na pewno chcesz odrzucić tę wizytę?",
    completeAppointmentMessage: "Czy na pewno chcesz zakończyć tę wizytę?",
    cancelAppointmentMessage: "Czy na pewno chcesz anulować tę wizytę?",
    appointmentStatusUpdated: "Status wizyty zaktualizowany",
    appointmentStatusUpdateFailed: "Nie udało się zaktualizować statusu wizyty",
    timeSlotUnavailable: "Ten termin jest niedostępny",
    timeSlotAvailable: "Termin jest dostępny",
    pastTimeError: "Nie można rezerwować wizyt w przeszłości",
    timeSlotAlreadyBooked: "Ten termin jest już zarezerwowany",
    deleteAppointment: "Usuń Wizytę",
    deleteAppointmentConfirm: "Czy na pewno chcesz usunąć tę wizytę z panelu administratora? (Pozostanie widoczna w kontach użytkowników)",
    appointmentDeleted: "Wizyta usunięta z panelu administratora",
    appointmentDeleteError: "Nie udało się usunąć wizyty",
    deleting: "Usuwanie...",
    
    // Delete dialogs
    deleteCourse: "Usuń Kurs",
    deleteCourseConfirm: "Czy na pewno chcesz usunąć ten kurs? Tej akcji nie można cofnąć.",
    deleteService: "Usuń Usługę",
    deleteServiceConfirm: "Czy na pewno chcesz usunąć tę usługę? Tej akcji nie można cofnąć."
  },
  
  uk: {
    home: "Головна",
    services: "Послуги",
    about: "Про нас",
    contact: "Контакти",
    portfolio: "Портфоліо",
    booking: "Запис",
    training: "Навчання",
    reviews: "Відгуки",
    account: "Акаунт",
    admin: "Адмін",
    login: "Вхід",
    logout: "Вихід",
    loginDescription: "Увійдіть, щоб отримати доступ до свого панелю",
    loginWithReplit: "Увійти через Replit",
    backToHome: "Повернутися на головну",
    loginRequired: "Щоб записатися на прийом, потрібно увійти в систему",
    toggleTheme: "Переключити тему",
    language: "Мова",
    common: {
      loading: "Завантаження...",
      processing: "Обробка...",
      beautyStudio: "Студія краси",
    },
    heroTitle: "Професійна лазерна епіляція та масаж",
    heroSubtitle: "Відчуйте найвищий рівень краси та здоров'я",
    heroDescription: "Трансформуйте свою шкіру за допомогою наших сучасних лазерних процедур та омолоджуючої масажної терапії. Записуйтесь на прийом сьогодні.",
    bookNow: "Записатися",
    servicesTitle: "Наші послуги",
    servicesDescription: "Відкрийте наш комплексний спектр косметичних та wellness процедур",
    learnMore: "Дізнатися більше",
    laserHairRemoval: "Лазерна епіляція",
    massage: "Масаж",
    spaServices: "Спа-послуги",
    laserHairRemovalDesc: "Безболісне видалення небажаного волосся сучасним обладнанням",
    massageDesc: "Професійні техніки масажу для здоров'я та релаксації",
    spaDesc: "Преміальні спа-процедури в комфортній атмосфері",
    trainingDesc: "Професійні курси для спеціалістів індустрії краси",
    priceFrom: "від",
    price: "Ціна",
    whyChooseUs: "Чому обирають нас",
    modernEquipment: "Сучасне обладнання",
    modernEquipmentDesc: "Ми використовуємо лише сертифіковане європейське обладнання",
    experiencedSpecialists: "Досвідчені спеціалісти",
    experiencedSpecialistsDesc: "Команда сертифікованих майстрів з багаторічним досвідом",
    individualApproach: "Індивідуальний підхід",
    individualApproachDesc: "Персональна програма для кожного клієнта",
    aboutTitle: "Про нас",
    aboutDescription: "Ми присвячуємо себе наданню виняткових косметичних та wellness послуг у комфортному та професійному середовищі.",
    contactTitle: "Контакти",
    contactDescription: "Зв'яжіться з нами, щоб призначити зустріч або поставити запитання.",
    phone: "Телефон",
    email: "Email",
    address: "Адреса",
    portfolioTitle: "Наша робота",
    portfolioDescription: "Подивіться на дивовижні результати, яких досягли наші клієнти завдяки нашим процедурам.",
    bookingTitle: "Записатися на прийом",
    bookingDescription: "Заплануйте своє відвідування нашого салону краси",
    selectService: "Оберіть послугу",
    selectDate: "Оберіть дату",
    selectTime: "Оберіть час",
    fullName: "Повне ім'я",
    emailAddress: "Адреса email",
    phoneNumber: "Номер телефону",
    submit: "Надіслати",
    trainingTitle: "Навчання та освіта",
    trainingDescription: "Професійні курси та сертифікати з косметичних процедур",
    courses: "Курси",
    coursesDescription: "Навчайтеся у досвідчених професіоналів",
    reviewsTitle: "Відгуки клієнтів",
    reviewsDescription: "Що говорять про наші послуги наші клієнти",
    clientReviews: "Відгуки",
    reviewAnna: "Чудовий салон! Професійний персонал, сучасне обладнання. Результати лазерної епіляції перевершили всі очікування.",
    reviewMaria: "Масаж просто чарівний! Майстер врахував всі мої побажання. Дуже розслаблююча атмосфера. Обов'язково прийду ще.",
    reviewElena: "Відмінний сервіс та індивідуальний підхід. Прийнятні ціни та висока якість. Рекомендую всім друзям!",
    reviewOlga: "Затишна атмосфера, чистота та професіоналізм. Спа-процедури просто захоплюючі. Відчуваю себе оновленою!",
    reviewTatyana: "Записалася на курс масажу. Дуже досвідчений інструктор, матеріал подається зрозуміло. Дуже задоволена!",
    reviewSvetlana: "Все дуже професійно організовано. Зручне онлайн-бронювання, нагадування. Уважний та ввічливий персонал.",
    accountTitle: "Особистий кабінет",
    personalAccount: "Кабінет",
    adminTitle: "Панель адміністратора",
    adminPanel: "Адміністрування",
    welcomeMessage: "Вітаємо в салоні краси LaserTouch",
    pageUnderConstruction: "Ця сторінка знаходиться в розробці",
    myAppointments: "Мої записи",
    profileSettings: "Налаштування профілю",
    bookingHistory: "Історія бронювань",
    dashboard: "Панель управління",
    manageBookings: "Керувати бронюваннями",
    manageUsers: "Керувати користувачами",
    viewReports: "Переглянути звіти",
    slide1Title: "Професійна лазерна епіляція",
    slide1Subtitle: "Відчуйте найвищий рівень косметичних процедур",
    slide1Description: "Передова лазерна технологія для постійного видалення волосся з мінімальним дискомфортом",
    slide2Title: "Розслаблююча масажна терапія",
    slide2Subtitle: "Омолодіть своє тіло та розум",
    slide2Description: "Profesjonalne techniki masażu dla здоров'я, добра самопочуття та глибокого розслаблення",
    slide3Title: "Розкішні спа-послуги",
    slide3Subtitle: "Насолоджуйтесь преміальними процедурами",
    slide3Description: "Повний спа-досвід з доглядом за обличчям та процедурами для тіла",
    seniorMaster: "Старший майстер",
    massageTherapist: "Масажист",
    cosmetologist: "Косметолог",
    trainingSpecialist: "Спеціаліст з навчання",
    administrator: "Адміністратор",
    laserEpilationSpec: "Лазерна епіляція",
    classicSpaSpec: "Класичний і спа-масаж",
    facialBodyCareSpec: "Догляд за обличчям та тілом",
    coursesWorkshopsSpec: "Курси та майстер-класи",
    consultationBookingSpec: "Консультації та запис",
    experienceYears: "років досвіду",
    certifiedSpecialistTitle: "Сертифікований спеціаліст",
    clientsCount: "клієнтів",
    diplomaMassage: "Диплом з масажу",
    specialistYear: "Спеціаліст року 2023",
    careExpert: "Експерт з догляду",
    internationalCert: "Міжнародний сертифікат",
    topTrainer: "Топ-тренер",
    graduatesCount: "випускників",
    bestService: "Найкращий сервіс",
    clientOriented: "Клієнтоорієнтований",
    footerDescription: "Ваше головне місце для професійної лазерної епіляції та масажної терапії.",
    followUs: "Стежте за нами",
    quickLinks: "Швидкі посилання",
    contactInfo: "Контактна інформація",
    allRightsReserved: "Усі права захищені.",
    workingHours: "Пн-Нд: 9:00 - 21:00",
    loading: "Завантаження...",
    error: "Помилка",
    success: "Успіх",
    close: "Закрити",
    save: "Зберегти",
    cancel: "Скасувати",
    confirm: "Підтвердити",
    duration: "Тривалість",
    minutes: "хв",
    buy: "Купити",
    hours: "годин",
    ourTeam: "Наша команда професіоналів",
    ourTeamDescription: "Познайомтеся з нашими сертифікованими спеціалістами з багаторічним досвідом",
    yearsExperience: "років досвіду",
    rating: "Рейтинг",
    certifiedSpecialist: "Сертифікований спеціаліст",
    clients: "клієнтів",
    kseniaNovak: "Ксения Гордиенко",
    howToFindUs: "Як нас знайти",
    locationDescription: "Ми знаходимося в зручному місці з відмінною транспортною доступністю",
    openInMaps: "Відкрити в картах",
    name: "Ім'я",
    namePlaceholder: "Ваше ім'я",
    phonePlaceholder: "+48 (___) ___-__-__",
    comments: "Коментар",
    commentsPlaceholder: "Додаткові побажання або запитання",
    bookAppointment: "Записатися",
    backToCourses: "Повернутися до курсів",
    courseDetails: "Деталі курсу",
    payment: "Оплата",
    paymentError: "Помилка оплати",
    paymentSuccess: "Оплата успішна!",
    paymentSuccessMessage: "Дякуємо за покупку курсу!",
    processing: "Обробка...",
    payAmount: "Сплатити",
    courseNotFound: "Курс не знайдено",
    returnToCourses: "Повернутися до курсів",
    cost: "Вартість",
    auth: {
      welcome: "Ласкаво просимо до LaserTouch",
      subtitle: "Увійдіть або створіть акаунт, щоб записатися на прийом",
      login: "Увійти",
      register: "Реєстрація",
      email: "Email",
      password: "Пароль",
      firstName: "Ім'я",
      lastName: "Прізвище",
      phone: "Номер телефону",
      emailPlaceholder: "Введіть email",
      passwordPlaceholder: "Введіть пароль",
      firstNamePlaceholder: "Введіть ім'я",
      lastNamePlaceholder: "Введіть прізвище",
      phonePlaceholder: "+48 (___) ___-__-__",
      loggingIn: "Входимо...",
      registering: "Реєструємо...",
      or: "або",
      googleLogin: "Увійти через Google",
      heroDescription: "Професійні косметичні послуги в центрі Варшави. Лазер, масаж, spa та навчання.",
      emailRequired: "Email обов'язковий",
      passwordRequired: "Пароль обов'язковий",
      firstNameRequired: "Ім'я обов'язкове",
      lastNameRequired: "Прізвище обов'язкове",
      phoneRequired: "Номер телефону обов'язковий",
      emailInvalid: "Введіть правильний email адрес",
      passwordMinLength: "Пароль повинен містити мінімум 6 символів",
      oauthError: "Помилка OAuth",
      oauthErrorMessage: "Вхід через Google не вдався. Спробуйте увійти через email/пароль.",
      googleTemporaryDisabled: "Вхід через Google тимчасово вимкнено",
      googleTemporaryDisabledMessage: "Будь ласка, використовуйте вхід через email/пароль поки ми виправляємо проблеми з Google OAuth.",
      loginWelcomeCreative: "Ви сьогодні чудово виглядаєте! Радий вас знову бачити!",
      loginWelcomeTitle: "З поверненням!"
    },
    laserEpilationCourse: "Курс лазерної епіляції",
    laserEpilationCourseDesc: "Професійне навчання лазерній епіляції",
    massageCourse: "Курс масажу",
    massageCourseDesc: "Професійне навчання масажу",
    skinCareCourse: "Курс догляду за шкірою",
    skinCareCourseDesc: "Професійне навчання догляду за шкірою",
    // --- Новые ключи ---
    reviewFormTitle: "Залиште свій відгук",
    reviewFormDescription: "Поділіться своєю думкою про наш центр. Ваш відгук з'явиться після модерації.",
    reviewFormNameLabel: "Ваше ім'я (необов'язково)",
    reviewFormNamePlaceholder: "Анонімно",
    reviewFormTextLabel: "Ваш відгук",
    reviewFormTextPlaceholder: "Напишіть ваш відгук...",
    reviewFormRatingLabel: "Ваша оцінка",
    reviewFormSubmit: "Надіслати відгук",
    reviewFormSubmitting: "Відправка...",
    reviewFormPending: "Відгук на модерації",
    reviewFormAnonymous: "Анонімно",
    reviewApprove: "Схвалити",
    reviewApproving: "Схвалення...",
    reviewReject: "Відхилити",
    reviewRejecting: "Відхилення...",
    reviewStatusPending: "На модерації",
    reviewStatusPublished: "Опубліковано",
    reviewStatusRejected: "Відхилено",
    reviewDelete: "Видалити",
    reviewDeleting: "Видалення...",
    reviewDeleteConfirm: "Ви впевнені, що хочете видалити цей відгук?",
    reviewDeleted: "Відгук успішно видалено!",
    reviewDeleteError: "Не вдалося видалити відгук.",
    adminStatusUpdated: "Статус адміністратора оновлено",
    adminStatusUpdateFailed: "Не вдалося оновити статус адміністратора",
    appointmentCreated: "Запис успішно створено",
    appointmentError: "Не вдалося створити запис",
    fillAllFields: "Заповніть всі обов'язкові поля",
    reviewsTab: "Відгуки клієнтів",
    pricesTab: "Ціни та тривалість",
    appointment: "Запис",
    appointments: "Записи",
    calendar: "Календар",
    date: "Дата",
    forDate: "На дату",
    unknownClient: "Невідомий клієнт",
    clientWithoutAccount: "Клієнт без акаунту",
    user: "Користувач",
    role: "Роль",
    adminAccess: "Доступ адміністратора",
    searchUsers: "Пошук користувачів...",
    noUsersFound: "Користувачів не знайдено",
    noAppointments: "Немає записів",
    noAppointmentsThisDay: "Немає записів на цю дату",
    completed: "Завершено",
    confirmed: "Підтверджено",
    pending: "Очікує",
    approved: "Схвалено",
    rejected: "Відхилено",
    cancelled: "Скасовано",
    add: "Додати",
    create: "Створити",
    delete: "Видалити",
    deleteConfirm: "Видалити цей елемент?",
    deleteWarning: "Цю дію не можна скасувати.",
    editPricesDesc: "Редагуйте ціни та тривалість курсів і процедур",
    moderationReviewsDesc: "Модерація відгуків користувачів",
    courseName: "Назва курсу",
    courseDescription: "Опис курсу",
    serviceName: "Назва послуги",
    addCourse: "Додати курс",
    addService: "Додати послугу",
    loadingReviews: "Завантаження відгуків...",
    noReviews: "Відгуків немає",
    saving: "Збереження...",
    added: "Додано",
    deleted: "Видалено",
    saveError: "Помилка збереження",
    deleteError: "Помилка видалення",
    addError: "Помилка додавання",
    uploadError: "Помилка завантаження зображення",
    service: "Послуга",
    appointmentsFor: "Записи на",
    calendarDesc: "Переглядайте та керуйте всіма записами за датою",
    userManagement: "Управління користувачами",
    totalUsers: "Всього користувачів",
    regularUsers: "Звичайні користувачі",
    unauthorized: "Неавторизований",
    accessDenied: "Доступ заборонено",
    adminAccessRequired: "Потрібен доступ адміністратора",
    errorLoadingUsers: "Помилка завантаження користувачів",
    firstName: "Ім'я",
    lastName: "Прізвище",
    confirmAppointment: "Підтвердити запис",
    rejectAppointment: "Відхилити запис",
    completeAppointment: "Завершити запис",
    cancelAppointment: "Скасувати запис",
    appointmentConfirmed: "Запис підтверджено",
    appointmentRejected: "Запис відхилено",
    appointmentCompleted: "Запис завершено",
    appointmentCancelled: "Запис скасовано",
    confirmAppointmentMessage: "Ви впевнені, що хочете підтвердити цей запис?",
    rejectAppointmentMessage: "Ви впевнені, що хочете відхилити цей запис?",
    completeAppointmentMessage: "Ви впевнені, що хочете завершити цей запис?",
    cancelAppointmentMessage: "Ви впевнені, що хочете скасувати цей запис?",
    appointmentStatusUpdated: "Статус запису оновлено",
    appointmentStatusUpdateFailed: "Не вдалося оновити статус запису",
    timeSlotUnavailable: "Цей час зайнятий",
    timeSlotAvailable: "Час доступний",
    pastTimeError: "Не можна бронювати записи в минулому",
    timeSlotAlreadyBooked: "Цей час вже заброньований",
    deleteAppointment: "Видалити Запис",
    deleteAppointmentConfirm: "Ви впевнені, що хочете видалити цей запис з панелі адміністратора? (Він залишиться видимим в облікових записах користувачів)",
    appointmentDeleted: "Запис видалено з панелі адміністратора",
    appointmentDeleteError: "Не вдалося видалити запис",
    deleting: "Видалення...",
    
    // Delete dialogs
    deleteCourse: "Видалити Курс",
    deleteCourseConfirm: "Ви впевнені, що хочете видалити цей курс? Цю дію не можна скасувати.",
    deleteService: "Видалити Послугу",
    deleteServiceConfirm: "Ви впевнені, що хочете видалити цю послугу? Цю дію не можна скасувати."
  },
};