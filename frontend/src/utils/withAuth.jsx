import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

//  @param {React.Component} Component 
 
const withAuth = (Component) => {
  const AuthenticatedComponent = (props) => {
    const { userData, loading } = useContext(AuthContext);
    if (loading) {
      return null; 
    }

    if (!userData) {
      return <Navigate to="/auth" replace />;
    }

    return <Component {...props} />;
  };

  return AuthenticatedComponent;
};

export default withAuth;
