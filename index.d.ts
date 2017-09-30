declare module "easytimer" {

    export class TimeCounter {

        secondTenths: number;
        seconds: number;
        minutes: number;
        hours: number;
        days: number;

        toString(units?: string[3] | null, separator?: string, leftZeroPadding?: number): string;
    }

    export type Precision = 'secondTenths' | 'seconds' | 'minutes' | 'hours' | 'days';
    export type Event = 'daysUpdated' | 'hoursUpdated' | 'minutesUpdated' | 'secondsUpdated' | 'secondTenthsUpdated';

    export interface ITimerParams {
        precision?: Precision;
        callback?: () => void;
        countdown?: boolean;
        target?: object;
        startValues?: object;
    }

    export class Timer {
        stop(): void;
        start(params?: ITimerParams): void;
        reset(): void;
        pause(): void;
        addEventListener(event: Event, listener: () => void): void;
        removeEventListener(event: Event, listener: () => void): void;
        dispatchEvent(event: string): void;
        isRunning(): boolean;
        isPaused(): boolean;
        getTimeValues(): TimeCounter;
        getTotalTimeValues(): TimeCounter;
    }

    export default Timer;
}
