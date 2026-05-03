// // src/components/atoms/HighTensionLoader.tsx
// import React from 'react';
// import { Loader2 } from 'lucide-react';

// interface HighTensionLoaderProps {
//   isVisible: boolean;
//   message?: string;
// }

// const HighTensionLoader: React.FC<HighTensionLoaderProps> = ({ 
//   isVisible, 
//   message = "Processing..." 
// }) => {
//   if (!isVisible) return null;
// //how to apply debuger
//   return (
//     <div className="fixed inset-0  z-[99981] flex items-center justify-center bg-black/50 backdrop-blur-sm">
   

//       <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl animate-fadeIn">
        
//         {/* Spinner with tension effect */}
//         <div className="relative mb-6">
//           <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
//           <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-spin"></div>
          
//           {/* Pulsating rings effect */}
//           <div className="absolute inset-0 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-ping opacity-30"></div>
//           <div className="absolute inset-[-8px] border-4 border-transparent border-t-[var(--primary)] rounded-full animate-ping opacity-20 delay-300"></div>
          
//           {/* Center icon */}
//           <div className="absolute inset-0 flex items-center justify-center">
//             <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
//           </div>
//         </div>

//         {/* Message */}
//         <div className="text-center max-w-sm">
//           <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
//             Please Wait
//           </h3>
//           <p className="text-gray-600 dark:text-gray-300 mb-4">
//             {message}
//           </p>
          
//           {/* Dots animation */}
//           <div className="flex justify-center space-x-2">
//             <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
//             <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
//             <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
//           </div>
          
//           <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 italic">
//             This may take a moment...
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default HighTensionLoader;








//V2
// src/components/atoms/HighTensionLoader.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Loader2 } from 'lucide-react';

interface HighTensionLoaderProps {
  isVisible: boolean;
  message?: string;
}

const HighTensionLoader: React.FC<HighTensionLoaderProps> = ({ 
  isVisible, 
  message = "Processing..." 
}) => {
  return (
    <Transition appear show={isVisible} as={Fragment}>
      <Dialog as="div" className="relative z-[99999]" onClose={() => {}}>
        {/* Background overlay - same as DeleteModal */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
        </Transition.Child>

        {/* Modal panel - centered like DeleteModal */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md">
              {/* Loader content */}
              <div className="flex flex-col items-center justify-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl">
                
                {/* Spinner with tension effect */}
                <div className="relative mb-6">
                  <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
                  <div className="absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-spin"></div>
                  
                  {/* Pulsating rings effect */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-[var(--primary)] rounded-full animate-ping opacity-30"></div>
                  <div className="absolute inset-[-8px] border-4 border-transparent border-t-[var(--primary)] rounded-full animate-ping opacity-20 delay-300"></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                  </div>
                </div>

                {/* Message */}
                <div className="text-center max-w-sm">
                  <Dialog.Title as="h3" className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Please Wait
                  </Dialog.Title>
                  <Dialog.Description className="text-gray-600 dark:text-gray-300 mb-4">
                    {message}
                  </Dialog.Description>
                  
                  {/* Dots animation */}
                  <div className="flex justify-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--primary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-6 italic">
                    This may take a moment...
                  </p>
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default HighTensionLoader;