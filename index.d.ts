export interface TimerValues {
    secondTenths?: number;
    seconds?: number;
    minutes?: number;
    hours?: number;
    days?: number;
}

export class TimeCounter implements TimerValues {
    secondTenths: number;
    seconds: number;
    minutes: number;
    hours: number;
    days: number;

    toString(units?: string[] | null, separator?: string, leftZeroPadding?: number): string;
}

export type Precision = 'secondTenths' | 'seconds' | 'minutes' | 'hours' | 'days';
export type TimerEventType = 'daysUpdated' | 'hoursUpdated' | 'minutesUpdated' | 'secondsUpdated' | 'secondTenthsUpdated' | 'targetAchieved' | 'stopped' | 'reset' | 'started' | 'paused';

export interface TimerEvent {
    detail: {
        timer: Timer
    }
}

export interface TimerParams {
    precision?: Precision;
    callback?: (timer: Timer) => void;
    countdown?: boolean;
    target?: TimerValues | [number,number,number,number,number];
    startValues?: TimerValues | [number,number,number,number,number];
}

export class Timer {
    constructor(defaultParams?: TimerParams);
    stop(): void;
    start(params?: TimerParams): void;
    reset(): void;
    pause(): void;
    addEventListener(eventType: TimerEventType, listener: (event: TimerEvent) => void): void;
    on(eventType: TimerEventType, listener: (event: TimerEvent) => void): void;
    removeEventListener(eventType: TimerEventType, listener: (event: TimerEvent) => void): void;
    removeAllEventListeners(eventType?: TimerEventType): void;
    off(eventType: TimerEventType, listener: (event: TimerEvent) => void): void;
    isRunning(): boolean;
    isPaused(): boolean;
    getTimeValues(): TimeCounter;
    getTotalTimeValues(): TimeCounter;
    getConfig(): TimerParams
}

export default Timer;
