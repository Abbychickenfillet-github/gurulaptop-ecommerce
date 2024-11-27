// context/LoadingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import LoadingAnimation from '@/components/LoadingAnimation/LoadingAnimation';

const LoadingContext = createContext();

export const LoadingProviderAnimation = ({ children, close = 3, CustomLoader }) => {
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, close * 1000);
    
    return () => clearTimeout(timer);
  }, [close]);

  const showLoading = () => setIsLoading(true);
  const hideLoading = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
      {children}
      {isLoading && CustomLoader && <CustomLoader />}
    </LoadingContext.Provider>
  );
};

// 加回 useLoading hook
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};