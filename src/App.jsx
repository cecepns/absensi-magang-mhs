import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { isAuthenticated } from './utils/auth';
import { requestGeolocation } from './utils/geolocation';

// Pages
import LandingPage from './pages/LandingPage';
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

// Components
import PrivateRoute from './components/PrivateRoute';

function App() {
  useEffect(() => {
    // Request geolocation permission on first load
    requestGeolocation()
      .then(() => {
        console.log('Location permission granted');
      })
      .catch((error) => {
        console.warn('Location permission denied:', error);
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

        {/* Mentor Routes */}
        <Route 
          path="/mentor/*" 
          element={
            <PrivateRoute allowedRoles={['mentor', 'pengurus']}>
              <MentorDashboard />
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