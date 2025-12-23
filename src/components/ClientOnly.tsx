import React, { useState, useEffect } from 'react';

interface ClientOnlyProps {
  loader: () => Promise<{ default: React.ComponentType<any> }>;
  fallback?: React.ReactNode;
  [key: string]: any; // To pass down other props
}

const ClientOnly: React.FC<ClientOnlyProps> = ({ loader, fallback = null, ...rest }) => {
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    loader().then(module => {
      setComponent(() => module.default);
    });
  }, [loader]);

  if (!Component) {
    return <>{fallback}</>;
  }

  // Pass the rest of the props to the dynamically loaded component
  return <Component {...rest} />;
};

export default ClientOnly;
