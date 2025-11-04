import { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function Tooltip({ tooltip, props }) {
   const triggerRef = useRef(null);
   const tooltipRef = useRef(null);
   const [isVisible, setIsVisible] = useState(false);
   const [position, setPosition] = useState({ x: 0, y: 0 });

   function updatePosition() {
      requestAnimationFrame(() => {
         const trigger = triggerRef.current;
         const tooltip = tooltipRef.current;
         if (!trigger || !tooltip) return;

         const triggerRect = trigger.getBoundingClientRect();
         const tooltipRect = tooltip.getBoundingClientRect();
         const padding = 10;

         let x = triggerRect.left + triggerRect.width / 2;
         let y = triggerRect.bottom + 8; // mt-2 equivalent

         const tooltipWidth = tooltipRect.width;
         const leftPos = x - tooltipWidth / 2;
         const rightPos = x + tooltipWidth / 2;

         if (rightPos > window.innerWidth - padding) {
            x = window.innerWidth - padding - tooltipWidth / 2;
         } else if (leftPos < padding) {
            x = padding + tooltipWidth / 2;
         }

         setPosition({ x, y });
      });
   }

   useEffect(() => {
      if (isVisible) {
         updatePosition();
         window.addEventListener('scroll', updatePosition, true);
         window.addEventListener('resize', updatePosition);

         return () => {
            window.removeEventListener('scroll', updatePosition, true);
            window.removeEventListener('resize', updatePosition);
         };
      }
   }, [isVisible, tooltip]);

   const tooltipElement =
      isVisible &&
      createPortal(
         <div
            ref={tooltipRef}
            className="pointer-events-none fixed z-[9999] min-w-[30vw] max-w-[30vw] rounded-md border border-solid border-[#414141] bg-[#272727] px-3 py-2 text-[1.5vw] max-sm:min-w-[80vw] max-sm:max-w-[80vw] max-sm:text-lg"
            style={{
               left: `${position.x}px`,
               top: `${position.y}px`,
               transform: 'translateX(-50%)',
            }}
         >
            {tooltip}
         </div>,
         document.body
      );

   return (
      <>
         <div
            ref={triggerRef}
            className="inline-block cursor-pointer"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
         >
            {props}
         </div>
         {tooltipElement}
      </>
   );
}
