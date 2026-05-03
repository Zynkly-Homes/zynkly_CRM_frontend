
// import { toast, ToastOptions } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const defaultOptions: ToastOptions = {
//   // position: "bottom-center",
//   // position:  "top-right",
//   autoClose: 4000,
//   hideProgressBar: true, //  Progress bar hidden
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
// };

// export const showToastnew = {
//   success: (message: string, options: ToastOptions = {}) => {
//     toast.success(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   error: (message: string, options: ToastOptions = {}) => {
//     toast.error(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   warning: (message: string, options: ToastOptions = {}) => {
//     toast.warning(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   info: (message: string, options: ToastOptions = {}) => {
//     toast.info(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
// };




// import { toast, ToastOptions } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const defaultOptions: ToastOptions = {
//   position: "bottom-center", // यह तो पहले से है
//   autoClose: 4000,
//   hideProgressBar: true,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   // Bottom से 30% up लाने के लिए
//   style: {
//     bottom: '30%', // यह toast को bottom से 30% ऊपर लाएगा
//   },
// };

// export const showToastnew = {
//   success: (message: string, options: ToastOptions = {}) => {
//     toast.success(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   error: (message: string, options: ToastOptions = {}) => {
//     toast.error(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   warning: (message: string, options: ToastOptions = {}) => {
//     toast.warning(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
//   info: (message: string, options: ToastOptions = {}) => {
//     toast.info(message, { 
//       ...defaultOptions,
//       ...options 
//     });
//   },
// };






// import { toast, ToastOptions, Slide } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const defaultOptions: ToastOptions = {
//   position: "bottom-center",
//   autoClose: 4000,
//   hideProgressBar: true,
//   closeOnClick: true,
//   pauseOnHover: true,
//   draggable: true,
//   transition: Slide, // Smooth slide transition
//   // Smooth animations के लिए
//   style: {
//     bottom: '30%',
//     transition: 'all 0.3s ease-in-out', // Smooth CSS transition
//   },
//   // Additional smoothness options
//   bodyStyle: {
//     transition: 'all 0.3s ease-in-out',
//   },
//   // Toast को धीरे-धीरे appear और disappear करने के लिए
//   closeButton: false,
//   // Toast appear/disappear की animation speed control
//   draggablePercent: 60,
//   // Toast container के लिए transition
//   toastStyle: {
//     transition: 'transform 0.1s ease-in-out, opacity 0.3s ease-in-out',
//   }
// };

// export const showToastnew = {
//   success: (message: string, options: ToastOptions = {}) => {
//     toast.success(message, { 
//       ...defaultOptions,
//       ...options,
//       // Custom transition और styling
//       className: 'toast-success-custom',
//     });
//   },
//   error: (message: string, options: ToastOptions = {}) => {
//     toast.error(message, { 
//       ...defaultOptions,
//       ...options,
//       className: 'toast-error-custom',
//     });
//   },
//   warning: (message: string, options: ToastOptions = {}) => {
//     toast.warning(message, { 
//       ...defaultOptions,
//       ...options,
//       className: 'toast-warning-custom',
//     });
//   },
//   info: (message: string, options: ToastOptions = {}) => {
//     toast.info(message, { 
//       ...defaultOptions,
//       ...options,
//       className: 'toast-info-custom',
//     });
//   },
// };



import { toast, ToastOptions, Slide } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const defaultOptions: ToastOptions = {
  position: "bottom-center",
  autoClose: 3000,
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  transition: Slide,
  // Fast animation के लिए transition time कम करें
  style: {
    bottom: '30%',
    transition: 'all 0.15s ease-in-out', // 0.3s से 0.15s कर दिया
  },
  bodyStyle: {
    transition: 'all 0.15s ease-in-out', // 0.3s से 0.15s कर दिया
  },
  closeButton: false,
  draggablePercent: 60,
  toastStyle: {
    transition: 'transform 0.15s ease-in-out, opacity 0.15s ease-in-out', // 0.1s और 0.3s से 0.15s कर दिया
  }
};

export const showToastnew = {
  success: (message: string, options: ToastOptions = {}) => {
    toast.success(message, { 
      ...defaultOptions,
      ...options,
    });
  },
  error: (message: string, options: ToastOptions = {}) => {
    toast.error(message, { 
      ...defaultOptions,
      ...options,
    });
  },
  warning: (message: string, options: ToastOptions = {}) => {
    toast.warning(message, { 
      ...defaultOptions,
      ...options,
    });
  },
  info: (message: string, options: ToastOptions = {}) => {
    toast.info(message, { 
      ...defaultOptions,
      ...options,
    });
  },
};