import { useContext } from 'react';
import Link from 'next/link';
// import { supabase } from "@/lib/supabaseClient";
// import { useQuery } from "@tanstack/react-query";

import { AppContext } from '@/contexts/AppContext';
import Recurring from '@/icons/Recurring';
import { tz, extractDayFromDateTime, shortDate } from '@/utils/dateformat';

const generateDate = (date, hourString) => {
    const dateObj = new Date(date);
    // hourString = "19"
    dateObj.setHours(hourString, 0, 0, 0);
    return dateObj;
}

const moveDateByMins = (date, minutes) => {
    // get current timezone offset
    const currentDate = new Date();
    const tzOffsetMinutes = currentDate.getTimezoneOffset();
    // calculate difference between current timezone offset & the mentor's timezone offset
    const diffMinutes = tzOffsetMinutes - minutes;
    const dateObj = new Date(date);
    // take date and + / - by diffMinutes
    dateObj.setMinutes(dateObj.getMinutes() + diffMinutes);
    return dateObj;
}

const moveDateTimeByMins = (date, hourString, sessionTimezone) => {
    date = generateDate(date, hourString);
    // console.log("date", date)
    const shiftedDate = moveDateByMins(date, sessionTimezone);
    // console.log("shiftedDate", shiftedDate)
    return shiftedDate
}


const MoreDates = ({ number_of_days }) => {

    if (number_of_days <= 1) return null;

    return <span className="tooltip tooltip-info" data-tip="More available dates">
        &nbsp;
        <span className="badge badge-warning dark:badge-info badge-xs font-light text-[0.7em]">+{+number_of_days - 1}
        </span>
    </span>
}

const getNearestDate = (day) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set the time to midnight

    let daysUntilTargetDay = (day + 7 - currentDate.getDay()) % 7;

    if (daysUntilTargetDay === 0) {
        daysUntilTargetDay = 7; // Target day is today, get next week's occurrence
    }

    currentDate.setDate(currentDate.getDate() + daysUntilTargetDay);
    return currentDate;
}

const OneTimeSession = ({ sessionData }) => {
    const oneTime = sessionData.one_time_date.filter(d => new Date(d) > new Date())

    if (oneTime.length === 0) {
        return (<></>)
    } else {
        return (
            <div className='col-span-4 text-center text-xs border rounded'>
                <div className='uppercase link-info hover:opacity-70'>
                    <Link href={`/book/${sessionData.id}`}>
                        {sessionData.title}
                    </Link>
                </div>
                <div className='font-bold text-md'>
                    <span className='font-light'>{extractDayFromDateTime(oneTime[0])},</span>
                    <span className='mx-1'>{
                        shortDate(moveDateTimeByMins(oneTime[0], sessionData.hours[0], sessionData.tz_gmt))
                    }</span>
                    <MoreDates number_of_days={oneTime.length} />
                </div>
                <div className='uppercase'>
                    {sessionData.hours.sort().map((hour) => {
                        return (
                            <div key={`${sessionData.id}_${hour}`}>
                                {moveDateTimeByMins(oneTime[0], hour, sessionData.tz_gmt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

const RecurringSession = ({ sessionData }) => {
    const date = getNearestDate(sessionData.day_of_week[0])
    return (
        <div className='col-span-4 text-center text-xs border rounded'>
            <div className='uppercase link-info hover:opacity-70'>
                <Link href={`/book/${sessionData.id}`}>
                    {sessionData.title}
                </Link>
            </div>
            <div className='font-bold text-md'>
                <span className='font-light'>{extractDayFromDateTime(date)},</span>
                &nbsp;{shortDate(moveDateTimeByMins(date, sessionData.hours[0], sessionData.tz_gmt))}&nbsp;
                <div className="tooltip tooltip-info" data-tip="Every Week">
                    <Recurring />
                </div>
                <MoreDates number_of_days={sessionData.day_of_week.length} />
            </div>
            <div className='uppercase'>
                {sessionData.hours.sort().map((hour) => {
                    return (
                        <div key={`${sessionData.id}_${hour}`}>
                            {moveDateTimeByMins(date, hour, sessionData.tz_gmt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


const Sessions = ({ sessionData }) => {
    if (sessionData && sessionData.length > 0)
        return sessionData
            .filter((session) => session.is_live)
            .map((sessionData) => {
                return sessionData.one_time_date.length > 0 ?
                    <OneTimeSession sessionData={sessionData} key={sessionData.id} />
                    : <RecurringSession sessionData={sessionData} key={sessionData.id} />
            })
    else {
        return null
    }
}

// const fetchSessionOfUser = async (userId) => {
//     const { data, error } = await supabase
//         .from('sessionManager')
//         .select()
//         .eq('mentor', userId)
//         .order('created_at', { ascending: false })

//     if (error) throw new Error(error, "Error fetching session")

//     if (!data) throw new Error("No session found")
//     return data
// }

const SessionCard = ({ data }) => {
    const { isLoggedIn } = useContext(AppContext);

    const SessionPicker = () => {

        return (
            <div className='mb-2'>
                <h4 className='font-bold tracking-tight text-sm'>
                    Book a 1:1 session with {data['fullname']}
                </h4>
                <p className='text-xs text-gray-400'>
                    {`Session times displayed in ${tz}`}
                </p>


                <div className='grid grid-cols-12 gap-2 mt-2'>
                    <Sessions sessionData={data['sessions']} />
                </div>

                {/* 3 x 2 grid */}
                {/* <div className='grid grid-cols-12 gap-2 mt-2'>
                    <div className='col-span-4 text-center text-xs border rounded'>
                        <div className='uppercase'>Thu</div>
                        <div className='font-extrabold text-md'>20 Jul</div>
                        <div className='uppercase'>19:30</div>
                    </div>
                    <div className='col-span-4 text-center text-xs border rounded'>
                        <div className='uppercase'>Fri</div>
                        <div className='font-extrabold text-md'>21 Jul</div>
                        <div className='uppercase'>18:00</div>
                    </div>
                    <div className='col-span-4 text-center text-xs border rounded'>
                        <div className='uppercase'>Thu</div>
                        <div className='font-extrabold text-md'>27 Jul</div>
                        <div className='uppercase'>19:30</div>
                    </div>
                    <div className='col-span-4 text-center text-xs border rounded'>
                        <div className='uppercase'>Thu</div>
                        <div className='font-extrabold text-md'>28 Jul</div>
                        <div className='uppercase'>16:00</div>
                    </div>
                    <div className='col-span-4 text-center text-xs border rounded'>
                        <div className='uppercase'>Thu</div>
                        <div className='font-extrabold text-md'>28 Jul</div>
                        <div className='uppercase'>17:00</div>
                    </div>
                </div> */}
            </div>
        )
    }

    const BookSession = () => {
        return (
            <div className="col-span-10 lg:col-span-4 text-white mx-1 self-start">
                <h3 className="text-lg uppercase font-semibold leading-normal mb-2 my-4">
                    Book a Session</h3>
                <div className="border-white border rounded-lg shadow-lg p-4">
                    <div className="flex items-start flex-row flex-wrap">
                        <SessionPicker />
                        <div className='italic text-sm text-white'>
                            <span className='text-xs'>
                                Booking feature to be added soon.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isLoggedIn) return <BookSession />
    return (
        <div>
            Please sign in to access this feature.
            <label htmlFor="enquire-modal"
                className="btn btn-outline btn-xs rounded hover:bg-rose-700">Enquire</label>
        </div>
    )
}

export default SessionCard