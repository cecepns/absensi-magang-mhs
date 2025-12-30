import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from './utils/auth';
import { requestGeolocation } from './utils/geolocation';

// Pages
import Register from './pages/Register';
import Login from './pages/Login';
import RoleSelection from './pages/RoleSelection';
import Dashboard from './pages/Dashboard';

// Student Pages
import ClockIn from './pages/student/ClockIn';
import ClockOut from './pages/student/ClockOut';
import Logbook from './pages/student/Logbook';

// Mentor Pages
import MentorDashboard from './pages/mentor/MentorDashboard';

// Pengurus Pages
import UserManagement from './pages/pengurus/UserManagement';

// Profile Page
import Profile from './pages/Profile';

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  useEffect(() => {
    // Check if geolocation is available before requesting
    if (!navigator.geolocation) {
      // Geolocation is not supported, silently skip
      return;
    }

    // Request geolocation permission on first load (optional, non-blocking)
    requestGeolocation()
      .then(() => {
        // Permission granted, but we don't need to log this
      })
      .catch((error) => {
        // Only log if it's not a permission/user denial error
        // Error codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
        if (error.code !== 1 && error.code !== 2) {
          // Only log unexpected errors (like timeout)
          console.warn('Geolocation error:', error.message);
        }
        // Silently handle permission denied or position unavailable
      });
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        {/* Role Selection */}
        <Route 
          path="/role-selection" 
          element={
            <PrivateRoute>
              <RoleSelection />
            </PrivateRoute>
          } 
        />

        {/* Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          } 
        />

        {/* Student Routes */}
        <Route 
          path="/clock-in" 
          element={
            <PrivateRoute allowedRoles={['mahasiswa']}>
              <ClockIn />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/clock-out" 
          element={
            <PrivateRoute allowedRoles={['mahasiswa']}>
              <ClockOut />
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/logbook" 
          element={
            <PrivateRoute allowedRoles={['mahasiswa']}>
              <Logbook />
            </PrivateRoute>
          } 
        />

        {/* Profile Route */}
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } 
        />

        {/* Mentor Routes */}
        <Route 
          path="/mentor/*" 
          element={
            <PrivateRoute allowedRoles={['mentor', 'pengurus']}>
              <MentorDashboard />
            </PrivateRoute>
          } 
        />

        {/* Pengurus Routes */}
        <Route 
          path="/pengurus/users" 
          element={
            <PrivateRoute allowedRoles={['pengurus']}>
              <UserManagement />
            </PrivateRoute>
          } 
        />

        {/* Redirect authenticated users from root */}
        <Route 
          path="*" 
          element={
            isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Navigate to="/" replace />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;