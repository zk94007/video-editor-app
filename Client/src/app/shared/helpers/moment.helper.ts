import * as moment from 'moment';
import { Moment } from 'moment';


export const toMillisecond = (seconds): Moment => {
    return moment.utc(seconds * 1000);
};

export const toSecond = (millisecond): Moment => {
    return moment.utc(millisecond / 1000);
};
