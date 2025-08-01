import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaMapMarkerAlt, FaCalendarAlt, FaBookmark } from 'react-icons/fa';
import './MobileNav.css';

function MobileNav() {
  return (
    <nav className="mobile-nav">
      <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FaMapMarkerAlt />
        <span>장소</span>
      </NavLink>
      
      <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FaCalendarAlt />
        <span>행사</span>
      </NavLink>
      
      <NavLink to="/my-places" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <FaBookmark />
        <span>내기록</span>
      </NavLink>
    </nav>
  );
}

export default MobileNav;
