# AgraRide - Test Cases Document

## Overview
This document contains comprehensive test cases for the AgraRide carpooling application, covering all functional requirements across Authentication, Ride Management, Booking System, GPS Tracking, Messaging, Rating System, SOS Emergency, and Admin Dashboard modules.

---

## Test Case Table

| Use Case ID | Use Case Scenario | Test Case ID | Test Case | Pre-Conditions | Test Step | Test Data | Expected Output | Actual Output | Test Status |
|-------------|-------------------|--------------|-----------|----------------|-----------|-----------|-----------------|---------------|-------------|
| UC-001 | User Registration | TC-001-01 | Valid user registration | Application is accessible | 1. Navigate to registration page<br>2. Enter valid name, email, password, phone, gender, vehicle type<br>3. Click Register button | Name: John Doe<br>Email: john@example.com<br>Password: password123<br>Phone: 9876543210<br>Gender: male<br>Vehicle: 4-wheeler | User account created successfully, redirected to login page with success message | | Pending |
| UC-001 | User Registration | TC-001-02 | Registration with existing email | User already exists with email | 1. Navigate to registration page<br>2. Enter email that already exists<br>3. Click Register button | Email: existing@example.com | Error message: "Email already in use" displayed, registration blocked | | Pending |
| UC-001 | User Registration | TC-001-03 | Registration with invalid email format | Application is accessible | 1. Navigate to registration page<br>2. Enter invalid email format<br>3. Click Register button | Email: invalid-email | Error message: "Invalid email format" displayed | | Pending |
| UC-001 | User Registration | TC-001-04 | Registration with empty required fields | Application is accessible | 1. Navigate to registration page<br>2. Leave name field empty<br>3. Click Register button | Name: (empty) | Error message: "Name is required" displayed | | Pending |
| UC-001 | User Registration | TC-001-05 | Registration with weak password | Application is accessible | 1. Navigate to registration page<br>2. Enter password less than 6 characters<br>3. Click Register button | Password: 123 | Error message: "Password must be at least 6 characters" | | Pending |
| UC-002 | User Login | TC-002-01 | Valid user login | User account exists | 1. Navigate to login page<br>2. Enter valid email and password<br>3. Click Login button | Email: john@example.com<br>Password: password123 | Login successful, user redirected to home dashboard, session stored in localStorage | | Pending |
| UC-002 | User Login | TC-002-02 | Login with invalid password | User account exists | 1. Navigate to login page<br>2. Enter valid email<br>3. Enter incorrect password<br>4. Click Login button | Email: john@example.com<br>Password: wrongpass | Error message: "Invalid credentials" displayed | | Pending |
| UC-002 | User Login | TC-002-03 | Login with non-existent email | Application is accessible | 1. Navigate to login page<br>2. Enter non-existent email<br>3. Click Login button | Email: nonexistent@example.com | Error message: "User not found" displayed | | Pending |
| UC-002 | User Login | TC-002-04 | Admin login | Admin account exists | 1. Navigate to login page<br>2. Enter admin credentials<br>3. Click Login button | Email: admin@agraride.com<br>Password: admin | Login successful, redirected to Admin Dashboard | | Pending |
| UC-002 | User Login | TC-002-05 | Login with empty fields | Application is accessible | 1. Navigate to login page<br>2. Leave email and password empty<br>3. Click Login button | Email: (empty)<br>Password: (empty) | Error message: "Email and password are required" | | Pending |
| UC-003 | User Profile Management | TC-003-01 | View user profile | User is logged in | 1. Click on Profile menu<br>2. View profile page | User ID: 1 | Profile page displays user details, ride statistics, and ratings | | Pending |
| UC-003 | User Profile Management | TC-003-02 | Update profile information | User is logged in | 1. Navigate to Profile page<br>2. Click Edit button<br>3. Update phone number<br>4. Click Save | Phone: 9998887777 | Profile updated successfully, success message displayed | | Pending |
| UC-003 | User Profile Management | TC-003-03 | Update profile with invalid data | User is logged in | 1. Navigate to Profile page<br>2. Click Edit button<br>3. Enter invalid phone format<br>4. Click Save | Phone: abc123 | Error message: "Invalid phone number format" | | Pending |
| UC-003 | User Profile Management | TC-003-04 | Change password | User is logged in | 1. Navigate to Profile page<br>2. Enter current password<br>3. Enter new password<br>4. Confirm new password<br>5. Click Update | Current: password123<br>New: newpass456 | Password updated successfully | | Pending |
| UC-004 | Ride Creation (Driver) | TC-004-01 | Create ride with valid data | Driver is logged in | 1. Click "Offer Ride"<br>2. Select vehicle type<br>3. Pick origin on map<br>4. Pick destination on map<br>5. Set departure time<br>6. Set available seats<br>7. Set price per seat<br>8. Click Create | Origin: Taj Mahal<br>Destination: Agra Fort<br>Seats: 3<br>Price: 150 | Ride created successfully, appears in "My Rides" | | Pending |
| UC-004 | Ride Creation (Driver) | TC-004-02 | Create ride without selecting locations | Driver is logged in | 1. Click "Offer Ride"<br>2. Fill other details<br>3. Skip location selection<br>4. Click Create | Origin: (not selected) | Error message: "Please select origin and destination" | | Pending |
| UC-004 | Ride Creation (Driver) | TC-004-03 | Create ride with zero seats | Driver is logged in | 1. Click "Offer Ride"<br>2. Set seats to 0<br>3. Click Create | Seats: 0 | Error message: "Seats must be between 1 and 6" | | Pending |
| UC-004 | Ride Creation (Driver) | TC-004-04 | Create ride with negative price | Driver is logged in | 1. Click "Offer Ride"<br>2. Set price to negative<br>3. Click Create | Price: -50 | Error message: "Price must be positive" | | Pending |
| UC-004 | Ride Creation (Driver) | TC-004-05 | Create ride with past departure time | Driver is logged in | 1. Click "Offer Ride"<br>2. Set departure time in past<br>3. Click Create | Time: Yesterday 10:00 AM | Error message: "Departure time must be in future" | | Pending |
| UC-005 | Ride Search (Passenger) | TC-005-01 | Search available rides | Passenger is logged in | 1. Click "Search Rides"<br>2. View list of active rides | - | List of available rides displayed with driver details and ratings | | Pending |
| UC-005 | Ride Search (Passenger) | TC-005-02 | View ride details | Passenger is logged in, rides available | 1. Click "Search Rides"<br>2. Click on a ride card | Ride ID: 1 | Ride details modal opens showing route preview, driver info, price | | Pending |
| UC-005 | Ride Search (Passenger) | TC-005-03 | Search with no available rides | Passenger is logged in | 1. Click "Search Rides"<br>2. Check when no rides exist | - | Message: "No rides available" displayed | | Pending |
| UC-005 | Ride Search (Passenger) | TC-005-04 | Preview route on map | Passenger is logged in, ride selected | 1. Click "Search Rides"<br>2. Select a ride<br>3. View route preview | Ride ID: 1 | Route displayed on map from origin to destination | | Pending |
| UC-006 | Booking Creation | TC-006-01 | Book ride without counter-offer | Passenger is logged in, ride available | 1. Select a ride<br>2. Enter number of seats<br>3. Click Book Now | Seats: 2 | Booking created with status "pending", confirmation message shown | | Pending |
| UC-006 | Booking Creation | TC-006-02 | Book ride with counter-offer | Passenger is logged in, ride available | 1. Select a ride<br>2. Enter seats<br>3. Enter counter-offer price<br>4. Click Book Now | Seats: 1<br>Counter: 100 | Booking created with counter-offer, status "pending" | | Pending |
| UC-006 | Booking Creation | TC-006-03 | Book ride with insufficient seats | Passenger is logged in, ride has 1 seat | 1. Select a ride with 1 seat<br>2. Request 3 seats<br>3. Click Book Now | Seats: 3 | Error message: "Not enough seats available" | | Pending |
| UC-006 | Booking Creation | TC-006-04 | Duplicate booking attempt | Passenger has pending booking for ride | 1. Try to book same ride again | Same Ride ID | Error message: "You already have a booking for this ride" | | Pending |
| UC-006 | Booking Creation | TC-006-05 | Book ride with zero seats | Passenger is logged in | 1. Select a ride<br>2. Enter 0 seats<br>3. Click Book Now | Seats: 0 | Error message: "At least 1 seat required" | | Pending |
| UC-007 | Booking Management (Driver) | TC-007-01 | View booking requests | Driver has pending bookings | 1. Navigate to "My Rides"<br>2. Click on a ride<br>3. View booking requests | Ride ID: 1 | List of pending booking requests displayed | | Pending |
| UC-007 | Booking Management (Driver) | TC-007-02 | Accept booking request | Driver has pending booking | 1. View booking requests<br>2. Click "Accept" on a request | Booking ID: 1 | Booking status changed to "confirmed", seats reduced, notification sent | | Pending |
| UC-007 | Booking Management (Driver) | TC-007-03 | Reject booking request | Driver has pending booking | 1. View booking requests<br>2. Click "Reject" on a request | Booking ID: 1 | Booking status changed to "rejected", passenger notified | | Pending |
| UC-007 | Booking Management (Driver) | TC-007-04 | Accept booking with counter-offer | Driver has counter-offer booking | 1. View booking with counter-offer<br>2. Click "Accept" | Booking ID: 1 | Booking confirmed at counter-offer price | | Pending |
| UC-007 | Booking Management (Driver) | TC-007-05 | Accept booking when insufficient seats | Driver has 1 seat, booking requests 2 | 1. Try to accept booking for 2 seats | Seats: 2 | Error message: "Not enough seats available" | | Pending |
| UC-008 | My Bookings (Passenger) | TC-008-01 | View my bookings | Passenger has bookings | 1. Navigate to "My Bookings" | User ID: 1 | List of all bookings with status displayed | | Pending |
| UC-008 | My Bookings (Passenger) | TC-008-02 | View booking details | Passenger has bookings | 1. Navigate to "My Bookings"<br>2. Click on a booking | Booking ID: 1 | Booking details with ride info, driver details, status shown | | Pending |
| UC-008 | My Bookings (Passenger) | TC-008-03 | Cancel pending booking | Passenger has pending booking | 1. Navigate to "My Bookings"<br>2. Click "Cancel" on pending booking | Booking ID: 1 | Booking status changed to "cancelled" | | Pending |
| UC-008 | My Bookings (Passenger) | TC-008-04 | Track confirmed booking | Passenger has confirmed booking | 1. Navigate to "My Bookings"<br>2. Click "Track" on confirmed ride | Booking ID: 1 | Live tracking page opens with map | | Pending |
| UC-009 | GPS Live Tracking | TC-009-01 | Start GPS tracking (Driver) | Driver has confirmed booking | 1. Navigate to "My Rides"<br>2. Click "Start Tracking"<br>3. Allow location permission | Ride ID: 1 | Tracking started, location updates every 3 seconds | | Pending |
| UC-009 | GPS Live Tracking | TC-009-02 | View driver location (Passenger) | Passenger has confirmed booking, driver tracking | 1. Navigate to "My Bookings"<br>2. Click "Track Ride" | Ride ID: 1 | Map shows driver current location with marker | | Pending |
| UC-009 | GPS Live Tracking | TC-009-03 | Location updates every 3 seconds | Driver is tracking | 1. Start tracking<br>2. Observe location updates | - | Location marker updates every 3 seconds | | Pending |
| UC-009 | GPS Live Tracking | TC-009-04 | Deny location permission | Driver tries to start tracking | 1. Click "Start Tracking"<br>2. Deny location permission | - | Error message: "Location permission required" | | Pending |
| UC-009 | GPS Live Tracking | TC-009-05 | Route visualization | Passenger viewing tracking | 1. Open live tracking<br>2. View route on map | Ride ID: 1 | Route line displayed from origin to destination | | Pending |
| UC-010 | In-App Messaging | TC-010-01 | Send message | User is in active ride | 1. Open chat from ride page<br>2. Type message<br>3. Click Send | Message: "Hello, I'm at pickup" | Message sent and displayed in chat | | Pending |
| UC-010 | In-App Messaging | TC-010-02 | Receive message | User has active ride | 1. Wait for incoming message<br>2. View notification | - | Message appears in chat with sender name | | Pending |
| UC-010 | In-App Messaging | TC-010-03 | View message history | User has ride with messages | 1. Open chat for ride<br>2. Scroll through messages | Ride ID: 1 | All previous messages displayed chronologically | | Pending |
| UC-010 | In-App Messaging | TC-010-04 | View inbox | User has multiple conversations | 1. Click Inbox icon<br>2. View conversation list | User ID: 1 | List of all conversations with latest message preview | | Pending |
| UC-010 | In-App Messaging | TC-010-05 | Send empty message | User is in chat | 1. Click Send without typing | Content: (empty) | Error: "Message cannot be empty" | | Pending |
| UC-011 | Rating System | TC-011-01 | Rate driver after ride | Ride is completed, passenger not rated | 1. Complete ride<br>2. Rating modal appears<br>3. Select 5 stars<br>4. Add comment<br>5. Submit | Rating: 5<br>Comment: "Great ride!" | Rating saved, average updated, thank you message shown | | Pending |
| UC-011 | Rating System | TC-011-02 | Rate passenger after ride | Ride is completed, driver not rated | 1. Complete ride<br>2. Rating modal appears<br>3. Select 4 stars<br>4. Submit | Rating: 4 | Rating saved successfully | | Pending |
| UC-011 | Rating System | TC-011-03 | View user ratings | Viewing user profile | 1. Navigate to user profile<br>2. View ratings section | User ID: 1 | Average rating and recent reviews displayed | | Pending |
| UC-011 | Rating System | TC-011-04 | Rate without stars | Rating modal open | 1. Click Submit without selecting stars | Rating: (none) | Error: "Please select a rating" | | Pending |
| UC-011 | Rating System | TC-011-05 | Rate with invalid value | Rating modal open | 1. Try to submit rating > 5 | Rating: 6 | Error: "Rating must be between 1 and 5" | | Pending |
| UC-012 | SOS Emergency System | TC-012-01 | Trigger SOS alert | User is in active ride | 1. Click SOS button<br>2. Confirm alert | Ride ID: 1 | SOS alert created, admin notified immediately | | Pending |
| UC-012 | SOS Emergency System | TC-012-02 | View SOS on admin dashboard | Admin is logged in, SOS triggered | 1. Navigate to Admin Dashboard<br>2. View SOS Alerts section | - | Active SOS alert displayed with ride and user details | | Pending |
| UC-012 | SOS Emergency System | TC-012-03 | Resolve SOS alert | Admin viewing active SOS | 1. Click on SOS alert<br>2. Click "Resolve" | Alert ID: 1 | Alert status changed to "resolved", removed from active list | | Pending |
| UC-012 | SOS Emergency System | TC-012-04 | SOS includes ride details | SOS triggered | 1. Trigger SOS<br>2. Check admin dashboard | Ride ID: 1 | Alert shows ride ID, user details, timestamp, live tracking link | | Pending |
| UC-012 | SOS Emergency System | TC-012-05 | Cancel SOS trigger | User clicked SOS by mistake | 1. Click SOS<br>2. Click Cancel in confirmation | - | SOS alert not created | | Pending |
| UC-013 | Admin Dashboard - Statistics | TC-013-01 | View system statistics | Admin is logged in | 1. Navigate to Admin Dashboard | - | Statistics displayed: total users, rides, bookings, active SOS | | Pending |
| UC-013 | Admin Dashboard - Statistics | TC-013-02 | Statistics update in real-time | Admin viewing dashboard | 1. New user registers<br>2. Check dashboard | - | User count updates automatically | | Pending |
| UC-014 | Admin Dashboard - User Management | TC-014-01 | View all users | Admin is logged in | 1. Navigate to Admin Dashboard<br>2. Click Users tab | - | List of all users with details displayed | | Pending |
| UC-014 | Admin Dashboard - User Management | TC-014-02 | Search users | Admin viewing users | 1. Enter search term in search box<br>2. Press Enter | Search: "john" | Filtered user list showing matching results | | Pending |
| UC-014 | Admin Dashboard - User Management | TC-014-03 | Delete user | Admin viewing users | 1. Find user in list<br>2. Click Delete<br>3. Confirm deletion | User ID: 5 | User deleted, success message, list refreshed | | Pending |
| UC-014 | Admin Dashboard - User Management | TC-014-04 | Change user role | Admin viewing users | 1. Find user<br>2. Click Change Role<br>3. Select new role<br>4. Save | User ID: 3<br>Role: admin | User role updated to admin | | Pending |
| UC-014 | Admin Dashboard - User Management | TC-014-05 | Delete non-existent user | Admin attempts deletion | 1. Try to delete already deleted user | User ID: 999 | Error message: "User not found" | | Pending |
| UC-015 | Admin Dashboard - Ride Management | TC-015-01 | View all rides | Admin is logged in | 1. Navigate to Admin Dashboard<br>2. Click Rides tab | - | List of all rides with status displayed | | Pending |
| UC-015 | Admin Dashboard - Ride Management | TC-015-02 | Complete ride | Admin viewing rides | 1. Find active ride<br>2. Click "Complete" | Ride ID: 1 | Ride status changed to "completed" | | Pending |
| UC-015 | Admin Dashboard - Ride Management | TC-015-03 | Delete ride | Admin viewing rides | 1. Find ride<br>2. Click Delete<br>3. Confirm | Ride ID: 1 | Ride deleted with cascade cleanup | | Pending |
| UC-015 | Admin Dashboard - Ride Management | TC-015-04 | Filter rides by status | Admin viewing rides | 1. Select status filter<br>2. Apply filter | Filter: active | Only active rides displayed | | Pending |
| UC-016 | Admin Dashboard - Database Access | TC-016-01 | View database tables | Admin is logged in | 1. Navigate to Database Manager<br>2. Click "List Tables" | - | All table names displayed | | Pending |
| UC-016 | Admin Dashboard - Database Access | TC-016-02 | View table data | Admin in Database Manager | 1. Select table from dropdown<br>2. Click "View Data" | Table: users | Table data displayed in grid format | | Pending |
| UC-016 | Admin Dashboard - Database Access | TC-016-03 | Execute SELECT query | Admin in Database Manager | 1. Enter SELECT query<br>2. Click Execute | Query: SELECT * FROM users | Query results displayed | | Pending |
| UC-016 | Admin Dashboard - Database Access | TC-016-04 | Execute invalid query | Admin in Database Manager | 1. Enter invalid SQL<br>2. Click Execute | Query: SELECT * FROM nonexistent | Error message with SQL error details | | Pending |
| UC-016 | Admin Dashboard - Database Access | TC-016-05 | Prevent destructive query | Admin attempts DELETE without WHERE | 1. Enter DELETE without WHERE<br>2. Click Execute | Query: DELETE FROM users | Error: "WHERE clause required for DELETE" | | Pending |
| UC-017 | My Rides (Driver) | TC-017-01 | View my rides | Driver has created rides | 1. Navigate to "My Rides" | Driver ID: 1 | List of driver's rides displayed | | Pending |
| UC-017 | My Rides (Driver) | TC-017-02 | Edit ride | Driver has active ride | 1. Navigate to "My Rides"<br>2. Click Edit<br>3. Modify price<br>4. Save | Ride ID: 1<br>New Price: 200 | Ride updated successfully | | Pending |
| UC-017 | My Rides (Driver) | TC-017-03 | Delete ride | Driver has ride with no bookings | 1. Navigate to "My Rides"<br>2. Click Delete<br>3. Confirm | Ride ID: 1 | Ride deleted successfully | | Pending |
| UC-017 | My Rides (Driver) | TC-017-04 | Complete ride manually | Driver has active ride | 1. Navigate to "My Rides"<br>2. Click "Complete" | Ride ID: 1 | Ride marked as completed | | Pending |
| UC-017 | My Rides (Driver) | TC-017-05 | View ride bookings | Driver has ride with bookings | 1. Navigate to "My Rides"<br>2. Click on ride | Ride ID: 1 | Booking requests for the ride displayed | | Pending |
| UC-018 | Navigation & UI | TC-018-01 | Navbar navigation | User is logged in | 1. Click each navbar link | - | All pages accessible, active state shown | | Pending |
| UC-018 | Navigation & UI | TC-018-02 | Responsive design | Application open on mobile | 1. Resize browser to mobile width<br>2. Check layout | Screen: 375px | Layout adapts, hamburger menu appears | | Pending |
| UC-018 | Navigation & UI | TC-018-03 | Logout functionality | User is logged in | 1. Click Logout button | - | User logged out, redirected to login, localStorage cleared | | Pending |
| UC-018 | Navigation & UI | TC-018-04 | Session persistence | User logged in previously | 1. Close browser<br>2. Reopen application | - | User still logged in (via localStorage) | | Pending |
| UC-018 | Navigation & UI | TC-018-05 | Protected routes | User not logged in | 1. Try to access /home directly | URL: /home | Redirected to login page | | Pending |
| UC-019 | Map Integration | TC-019-01 | Load OpenStreetMap | User on map page | 1. Navigate to Search Rides or Offer Ride | - | Map loads with tiles from OpenStreetMap | | Pending |
| UC-019 | Map Integration | TC-019-02 | Pick location on map | User creating ride | 1. Click on map<br>2. Marker placed | Lat: 27.1767<br>Lng: 78.0081 | Location coordinates captured | | Pending |
| UC-019 | Map Integration | TC-019-03 | Search location by name | User creating ride | 1. Enter location name<br>2. Click Search | Location: "Taj Mahal" | Suggestions displayed, can select location | | Pending |
| UC-019 | Map Integration | TC-019-04 | Calculate route | Origin and destination set | 1. Set origin<br>2. Set destination | Origin: Taj Mahal<br>Dest: Agra Fort | Route calculated and displayed on map | | Pending |
| UC-019 | Map Integration | TC-019-05 | Map auto-fit bounds | Multiple markers on map | 1. View ride with multiple points | - | Map zooms to fit all markers | | Pending |
| UC-020 | Performance & Security | TC-020-01 | Page load time | Application running | 1. Navigate to any page<br>2. Measure load time | - | Page loads within 2 seconds | | Pending |
| UC-020 | Performance & Security | TC-020-02 | API response time | Application running | 1. Make API request<br>2. Measure response time | Endpoint: /api/rides | Response within 1 second | | Pending |
| UC-020 | Performance & Security | TC-020-03 | SQL injection prevention | Application running | 1. Enter SQL in input field<br>2. Submit | Input: "'; DROP TABLE users; --" | Input sanitized, no SQL injection | | Pending |
| UC-020 | Performance & Security | TC-020-04 | XSS prevention | Application running | 1. Enter script in message<br>2. Send | Input: "<script>alert('xss')</script>" | Script escaped, not executed | | Pending |
| UC-020 | Performance & Security | TC-020-05 | Role-based access control | Regular user logged in | 1. Try to access admin endpoints | URL: /api/admin/stats | 403 Forbidden response | | Pending |

---

## Test Case Summary by Module

| Module | Total Test Cases | Priority |
|--------|------------------|----------|
| User Authentication (UC-001, UC-002) | 10 | High |
| User Profile Management (UC-003) | 4 | Medium |
| Ride Management (UC-004, UC-005, UC-017) | 15 | High |
| Booking System (UC-006, UC-007, UC-008) | 15 | High |
| GPS Live Tracking (UC-009) | 5 | High |
| In-App Messaging (UC-010) | 5 | Medium |
| Rating System (UC-011) | 5 | Medium |
| SOS Emergency System (UC-012) | 5 | High |
| Admin Dashboard (UC-013, UC-014, UC-015, UC-016) | 20 | High |
| Navigation & UI (UC-018) | 5 | Medium |
| Map Integration (UC-019) | 5 | High |
| Performance & Security (UC-020) | 5 | High |
| **TOTAL** | **99** | - |

---

## Test Execution Priority

### Phase 1: Critical Path (High Priority)
- UC-001: User Registration
- UC-002: User Login
- UC-004: Ride Creation
- UC-005: Ride Search
- UC-006: Booking Creation
- UC-007: Booking Management
- UC-009: GPS Live Tracking
- UC-012: SOS Emergency System

### Phase 2: Core Features (Medium Priority)
- UC-003: User Profile Management
- UC-008: My Bookings
- UC-010: In-App Messaging
- UC-011: Rating System
- UC-017: My Rides
- UC-018: Navigation & UI

### Phase 3: Admin & Advanced (High Priority)
- UC-013: Admin Statistics
- UC-014: User Management
- UC-015: Ride Management
- UC-016: Database Access
- UC-019: Map Integration
- UC-020: Performance & Security

---

## Document Information

| Property | Value |
|----------|-------|
| **Document** | AgraRide Test Cases |
| **Version** | 1.0 |
| **Date** | March 2026 |
| **Total Test Cases** | 99 |
| **Status** | Ready for Execution |

