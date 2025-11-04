import React from 'react';

const SimpleCheckbox = ({ checked, setChecked }) => {
   const handleChange = () => setChecked(!checked);

   return (
      <label className="relative block size-[2vw] cursor-pointer overflow-hidden rounded-[0.7vw] border border-solid border-white max-sm:size-4 max-sm:rounded-md">
         <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            className="peer invisible absolute left-[50px]"
         />
         <div
            className={`absolute z-[100] size-[3vw] rotate-45 bg-white transition-all duration-300 ease-in-out max-sm:size-5 ${
               checked
                  ? 'left-[-0.5vw] top-[-0.5vw] max-sm:left-[-4px] max-sm:top-[-4px]'
                  : 'left-[-3vw] top-[-3vw] max-sm:left-[-24px] max-sm:top-[-24px]'
            }`}
         ></div>
      </label>
   );
};

export default SimpleCheckbox;
