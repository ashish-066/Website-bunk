'use client';

import {
   ACCESS_TOKEN_NAME,
   API_BASE_URL,
   ACCESS_TIMETABLE_NAME,
} from '@/app/_utils/api_constants';
import axios from 'axios';
import Graph from './graph';
import { useState, useEffect, useContext } from 'react';
import HeightLimit from '../height_limit_scrollable/heightLimit';
import { useRouter } from 'next/navigation';
import { RefreshContext } from '@/app/_contexts/refresh';
import { useNotifications } from '@/app/_contexts/notification';
import SimpleCheckbox from '../ui/simple_checkbox';
import QuestionMark from '../svg/question-mark';
import { Tooltip } from '../ui/tooltip';

export default function Data() {
   const [hw, setHw] = useState('50vh');
   // const smRatio = 297;
   // const lgRatio = 0.218;
   const smRatio = 180;
   const lgRatio = 0.09;
   const [statData, setStatData] = useState([]);
   const [trueStatData, setTrueStatData] = useState([]);
   const [name, setName] = useState('');
   const [threshold, setThreshold] = useState(0);
   const [isTrueAttendance, setIsTrueAttendance] = useState(false);
   const [displayStat, setDisplayStat] = useState([]);
   const { refreshCont } = useContext(RefreshContext);
   const router = useRouter();
   const { addNotification } = useNotifications();
   const header = {
      Authorization:
         'Token ' + JSON.parse(localStorage.getItem(ACCESS_TOKEN_NAME)),
   };

   useEffect(() => {
      axios
         .get(API_BASE_URL + '/statquery', { headers: header })
         .then((response) => {
            if (response.status === 200) {
               setStatData(response.data);
            } else {
               addNotification('Unexpected server response.');
            }
         })
         .catch((error) => {
            if (error.response) {
               if (error.response.status === 401) {
                  addNotification('Session expired. Redirecting to login...');
                  router.push('/login');
               } else {
                  addNotification('Server error while fetching stats.');
               }
            } else if (error.request) {
               addNotification(
                  'No response from server. Check your connection.'
               );
            } else {
               addNotification('Request setup failed. Please try again.');
            }
         });
      axios
         .get(API_BASE_URL + '/current', { headers: header })
         .then((response) => {
            if (response.status === 200) {
               setTrueStatData(response.data);
            } else {
               addNotification('Unexpected server response.');
            }
         })
         .catch((error) => {
            if (error.response) {
               if (error.response.status === 401) {
                  addNotification('Session expired. Redirecting to login...');
                  router.push('/login');
               } else {
                  addNotification('Server error while fetching true stats.');
               }
            } else if (error.request) {
               addNotification(
                  'No response from server. Check your connection.'
               );
            } else {
               addNotification('Request setup failed. Please try again.');
            }
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [refreshCont]);

   useEffect(() => {
      if (isTrueAttendance) {
         const transformedData = trueStatData.map((item) => {
            const attended = item.classes_present;
            const bunked = item.bunks_taken;
            const totalClasses = attended + bunked;
            const bunksAvailable = Math.floor(
               (totalClasses * (100 - threshold)) / 100 - bunked
            );

            return {
               name: item.name,
               percentage: item.current_percentage,
               bunks_available: bunksAvailable,
            };
         });
         setDisplayStat(transformedData);
      } else {
         setDisplayStat(statData);
      }
   }, [isTrueAttendance, trueStatData, statData, threshold]);

   useEffect(() => {
      HeightLimit({ setHw, smRatio, lgRatio });
      return () => {
         window.removeEventListener('resize', {});
      };
   }, []);

   useEffect(() => {
      axios
         .get(API_BASE_URL + '/collection', { headers: header })
         .then(function (response) {
            if (response.status === 200) {
               sessionStorage.setItem(
                  ACCESS_TIMETABLE_NAME,
                  JSON.stringify(response.data)
               );
               const str = response.data.name;
               var list;
               if (str.indexOf(' ') != -1) {
                  list = [
                     str.substring(0, str.indexOf(' ')),
                     str.substring(str.indexOf(' ') + 1),
                  ];
               } else {
                  list = [str];
               }
               setName(list);
               setThreshold(response.data.threshold);
            } else {
               addNotification('Unexpected response from server.');
            }
         })
         .catch((error) => {
            if (error.response) {
               if (error.response.status === 401) {
                  addNotification('Session expired. Redirecting to login...');
                  router.push('/login');
               } else {
                  addNotification(
                     'Server error. Error status:',
                     error.response.status
                  );
               }
            } else if (error.request) {
               addNotification(
                  'No response from server. Please check your connection.'
               );
            } else {
               addNotification(
                  'Failed to send request. Please contact support.'
               );
            }
         });
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   const avg = (key) => {
      let sum = 0;
      displayStat.forEach((sub) => {
         sum += sub[key];
      });
      return key == 'percentage' ? (sum / displayStat.length).toFixed(0) : sum;
   };

   return (
      <div
         className="no-scrollbar mx-[3vw] mt-[2vw] flex h-full flex-1 flex-col overflow-auto font-light max-sm:m-5 max-sm:mb-0"
         style={{ height: hw }}
      >
         <div className="sticky top-0 bg-[#1c1c1c]">
            <div className="max-sm:mb-2">
               <div className="text-[6vw] leading-[6vw] max-sm:text-6xl">
                  <ExpandableName name={name} />
               </div>
               <div className="my-[0.75vw] flex justify-start">
                  <div
                     className={`flex items-center gap-x-[0.5vw] rounded-[2vw] p-[1vw] max-sm:gap-x-1 max-sm:rounded-2xl max-sm:px-2 ${isTrueAttendance ? 'bg-[#272727]' : ''}`}
                  >
                     <SimpleCheckbox
                        checked={isTrueAttendance}
                        setChecked={setIsTrueAttendance}
                     />
                     <p className="text-[1.5vw] max-sm:text-lg">
                        Show True Attendance
                     </p>
                     <Tooltip
                        props={
                           <div className="flex size-[1.5vw] text-[#727272] max-sm:size-5">
                              <QuestionMark />
                           </div>
                        }
                        tooltip={
                           <p>
                              <strong>True attendance</strong> is your current
                              attendance right now, not the expected one by the
                              end of the term. <br />
                              <br />
                              For example, if a semester has 20 classes in total
                              and you&apos;ve attended 7 out of the 10 classes
                              conducted so far (3 bunks), your overall
                              attendance would be calculated as{' '}
                              <code>(10 + 7) / 20 = 85%</code>&nbsp;, but your
                              true attendance would be &nbsp;
                              <code>7 / 10 = 70%</code>.
                           </p>
                        }
                     />
                  </div>
               </div>
            </div>
            <div className="flex">
               <div className="flex flex-[2] items-center">
                  <p className="text-[4.3vw] leading-none max-sm:text-5xl">
                     {avg('percentage')}
                     <span className="text-[3vw] max-sm:text-4xl">%</span>
                  </p>
                  <p className="ml-4 text-[1.4vw] leading-[1.8vw] max-sm:ml-1 max-sm:text-sm max-sm:leading-4">
                     Overall
                     <br />
                     attendance
                  </p>
               </div>
               <div className="flex flex-[3] items-center justify-start max-sm:justify-center">
                  <p className="text-[4.3vw] leading-none max-sm:text-5xl">
                     {avg('bunks_available')}
                     <span className="text-[3vw] max-sm:text-4xl">b</span>
                  </p>
                  <p className="ml-4 text-[1.5vw] leading-[2vw] max-sm:ml-1 max-sm:text-sm max-sm:leading-4">
                     Overall
                     <br />
                     bunks left
                  </p>
               </div>
               <div className="flex items-center text-center max-sm:hidden">
                  <p className="ml-4 text-[1.5vw] leading-[2vw] max-sm:ml-1 max-sm:text-sm max-sm:leading-4">
                     Bunks
                     <br />
                     left
                  </p>
               </div>
            </div>
         </div>
         <div className="flex h-full flex-1" id="victimer">
            <div
               className="flex h-full flex-1"
               // overflow-auto"
               // style={{ height: hw }}
            >
               <Graph
                  statData={displayStat}
                  threshold={threshold}
                  setThreshold={setThreshold}
               />
            </div>
         </div>
      </div>
   );
}

function ExpandableName({ name }) {
   const [expanded, setExpanded] = useState(false);

   return (
      <div
         className="w-full cursor-pointer text-[6vw] max-sm:text-6xl"
         onClick={() => setExpanded(!expanded)}
      >
         <p
            className={`w-full max-w-[90vw] overflow-hidden text-ellipsis md:max-w-[60vw] ${
               expanded
                  ? 'whitespace-normal'
                  : 'min-h-[67px] overflow-x-hidden whitespace-nowrap'
            }`}
            title={name[0] + ' ' + name[1]}
         >
            <span>{name[0]}</span> <span className="font-thin">{name[1]}</span>
         </p>
      </div>
   );
}
