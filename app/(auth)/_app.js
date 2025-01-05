import { AuthProvider } from '../../context/useAuth';

const myApp = ({ children }) => {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
};

export default myApp;