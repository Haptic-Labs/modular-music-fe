import dayjs from 'dayjs';
import calendar from 'dayjs/plugin/calendar';

dayjs.extend(calendar);

export const formatTimestamp = (timestamp: string | Date | number) => {
  const dayjsTimestamp = dayjs(timestamp);
  const isSameYear = dayjsTimestamp.isSame(new Date(), 'year');
  const dateFormat = isSameYear ? 'MMM D, h:mm a' : 'MMM D, YYYY, h:mm a';
  return dayjsTimestamp.calendar(null, {
    nextDay: '[Tomorrow at] h:mm a',
    sameDay: '[Today at] h:mm a',
    lastDay: '[Yesterday at] h:mm a',
    lastWeek: dateFormat,
    sameElse: dateFormat,
  });
};
