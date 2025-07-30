# LaserTouch Beauty Salon Application

## Overview

This is a full-stack web application for LaserTouch, a beauty salon offering laser hair removal, massage, spa treatments, and professional training courses. The application provides a complete booking system, user management, course enrollment, and admin dashboard functionality.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives with shadcn/ui components
- **Build Tool**: Vite for fast development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript throughout
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon serverless PostgreSQL
- **API Style**: RESTful API with JSON responses
- **Development**: In-memory storage fallback for development

### Design System
- **Color Palette**: Sage green primary (#5A7C54), cream backgrounds, gold accents
- **Typography**: Custom CSS variables for consistent theming
- **Component Library**: Comprehensive set of reusable UI components
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints

## Key Components

### Database Schema
- **Users**: Customer information (name, email, phone, timestamps)
- **Services**: Beauty services (laser, massage, spa treatments)
- **Appointments**: Booking system with status tracking
- **Reviews**: Customer feedback with ratings
- **Courses**: Training programs with pricing and duration

### API Endpoints
- `GET/POST /api/users` - User management
- `GET /api/services` - Service catalog
- `GET/POST /api/appointments` - Booking system
- `GET/POST /api/reviews` - Review management
- `GET/POST /api/courses` - Course management

### Page Structure
- **Home**: Hero section with services overview
- **Booking**: Service selection and appointment scheduling
- **Training**: Course catalog and enrollment
- **Reviews**: Customer testimonials display
- **Account**: User profile and appointment history
- **Admin**: Dashboard for business management

## Data Flow

1. **Client Requests**: Frontend makes API calls using TanStack Query
2. **Server Processing**: Express routes handle business logic
3. **Database Operations**: Drizzle ORM manages PostgreSQL interactions
4. **Response Handling**: JSON responses with proper error handling
5. **State Updates**: React Query manages cache invalidation and updates

## External Dependencies

### Production Dependencies
- **Database**: @neondatabase/serverless for PostgreSQL connection
- **ORM**: drizzle-orm with drizzle-zod for type-safe schemas
- **UI Framework**: Extensive Radix UI component library
- **Styling**: Tailwind CSS with PostCSS processing
- **Forms**: React Hook Form with Zod validation
- **Date Handling**: date-fns for date manipulation

### Development Tools
- **Build**: Vite with React plugin and TypeScript support
- **Database**: drizzle-kit for schema management and migrations
- **Runtime**: tsx for TypeScript execution in development
- **Replit Integration**: Custom plugins for Replit environment

## Deployment Strategy

### Development Environment
- **Server**: Node.js with tsx for TypeScript execution
- **Frontend**: Vite dev server with HMR (Hot Module Replacement)
- **Database**: Drizzle push for schema synchronization
- **Environment**: Replit-specific optimizations and error handling

### Production Build
- **Frontend**: Vite build process generating optimized static assets
- **Backend**: esbuild bundling for Node.js deployment
- **Database**: PostgreSQL migrations via drizzle-kit
- **Deployment**: Single-command build and start process

### Key Architectural Decisions

1. **Monorepo Structure**: Shared schema between client and server for type safety
2. **TypeScript First**: Full TypeScript implementation for better developer experience
3. **Component-Based UI**: Radix UI + shadcn/ui for consistent, accessible components
4. **Server-Side Rendering**: Static site generation with client-side hydration
5. **Database Strategy**: Drizzle ORM chosen for type safety and PostgreSQL compatibility
6. **State Management**: TanStack Query eliminates need for complex client state management
7. **Development Experience**: Vite and hot reloading for fast iteration cycles

The application prioritizes type safety, developer experience, and maintainability while providing a professional booking system for beauty salon operations.

## Recent Changes (January 2025)

### Staff Slider Enhancement
- **Infinite Loop**: Implemented seamless infinite scrolling for staff slider
- **Improved Design**: Added premium styling with gradient backgrounds, ratings, achievements, and hover effects
- **Enhanced Content**: Staff members now display ratings, achievements, and professional credentials
- **Better UX**: Smooth transitions, professional cards design, and elegant progress indicators

### Location Map Integration
- **Real Map**: Added Google Maps iframe for actual location visualization
- **Contact Simplification**: Removed address from footer, streamlined contact information
- **Polish Address**: Updated to Warsaw address: Aleja Pułkownika Władysława Beliny-Prażmowskiego 20A
- **Phone Update**: Changed to Polish phone number: +48 22 123 45 67

### Typography Enhancement (January 2025)
- **Elegant Fonts**: Implemented Google Fonts - Playfair Display for headings and Inter for body text
- **Feminine Appeal**: Applied sophisticated typography targeting female audience
- **Consistent Styling**: Updated all headings (h1-h6) to use Playfair Display font
- **Professional Look**: Enhanced navigation, service cards, and staff profiles with elegant typography
- **CSS Variables**: Added font-playfair and font-inter classes for consistent usage

### Multilingual Support Implementation (January 2025)
- **Three Languages**: Complete support for Polish, Ukrainian, and English
- **Language Context**: Implemented React Context for language state management with localStorage persistence
- **Language Selector**: Added dropdown in header navigation positioned left of theme toggle
- **Comprehensive Translations**: Full translation coverage for all pages and components including:
  - Navigation menu and footer
  - Home page hero section and services
  - Staff slider and location map
  - Booking form with all fields and placeholders
  - Training, Reviews, Account, and Admin pages
  - Form validation messages and UI elements
- **Dynamic Content**: All text content dynamically switches between languages
- **Persistent Selection**: Language choice saved in localStorage across sessions

### Authentication System Implementation (January 2025)
- **Custom Authentication**: Replaced Replit Auth with custom system using passport.js
- **Dual Login Methods**: Email/password authentication and Google OAuth integration
- **Database Schema**: New user schema with bcrypt password hashing and Google ID support
- **Session Management**: PostgreSQL session store with secure cookie configuration
- **Multilingual Auth**: Login and registration forms translated to all three languages
- **API Endpoints**: Complete auth API with /login, /register, /logout, /google routes
- **Security Features**: Password hashing, session persistence, and OAuth token handling

### Booking System Implementation (January 2025)
- **Real Database Integration**: Replaced mock data with actual PostgreSQL database services
- **Authentication Required**: Booking system requires user login for appointments
- **Form Validation**: Proper validation with minimum date restrictions and required fields
- **API Integration**: Complete appointment creation with proper error handling
- **Cache Management**: Automatic invalidation of appointment queries for real-time updates
- **Admin Dashboard**: All appointments display in admin panel with user details
- **User Account**: Personal appointment history visible in user account page

### Responsive Design Optimization (January 2025)
- **Mobile-First Design**: Comprehensive responsive layout across all components
- **Navigation Enhancement**: Fixed header overflow issues with collapsible mobile menu
- **Breakpoint Optimization**: Consistent sm/md/lg breakpoints throughout the application
- **Touch-Friendly UI**: Larger touch targets and improved mobile interaction
- **Performance Optimization**: Optimized image loading and component rendering
- **Production Ready**: All pages tested and optimized for deployment
- **Cross-Device Compatibility**: Seamless experience from mobile to desktop

### UI/UX Improvements
- Staff slider now uses gradient backgrounds and professional card layouts
- Location section shows only phone, hours, and transportation info
- Map is fully interactive with "Open in Maps" functionality
- Removed redundant address display from footer section
- All text elements now use elegant, feminine-friendly typography
- Complete multilingual user interface with seamless language switching
- Fully responsive design with consistent spacing and typography scaling