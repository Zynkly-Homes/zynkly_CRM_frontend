
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
// import { useDarkMode } from '../hooks/useDarkMode';

export const ToastifynewToaster: React.FC = () => {
  // const { isDarkMode } = useDarkMode();

  return (
    <ToastContainer
      position="top-right" //  Ideal toast position
      autoClose={4000}
      hideProgressBar={true}
      newestOnTop={true}
      closeOnClick={true}
      rtl={false}
      pauseOnFocusLoss={false}
      draggable={true}
      pauseOnHover={true}
      // theme={isDarkMode ? "dark" : "light"}
      
    />
    
    
  );
  
};