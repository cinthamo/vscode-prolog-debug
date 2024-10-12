import { EventEmitter } from 'events';
import WebSocket from 'ws';

export interface IEngineVariableData
{    
    name: string;
    type: string;
    value: any;
}

export interface IEngineStackFrame
{
    file: string;
    line: number;
    column: number;
    predicate: string;
    repetition: number;
    variables: Array<IEngineVariableData>;
}

export interface IEngineStopData
{
    stack: Array<IEngineStackFrame>;
    stopName: string;
}

export class EngineSocket extends EventEmitter {
    private _ws: WebSocket;
    private _started = false;
    private _saveEmit: {event: string, arg: any}[] = [];
    private _writeDebugLog = false;

    private debuglog(text: string) {
        if (this._writeDebugLog) {
            console.log(text);
        }
    }

    public constructor(ws: WebSocket, writeDebugLog: boolean) {
        super();
        this._ws = ws;
        this._writeDebugLog = writeDebugLog;
        this.debuglog('EngineSocket created');
        ws.on('message', (bytesArray: ArrayBuffer) => {
            const decoder: TextDecoder = new TextDecoder('utf-8');
            var jsonString = decoder.decode(bytesArray);
            this.debuglog(`Message received ${JSON.stringify(jsonString)}`);
            if (jsonString === 'ping')
            {
                this._ws.send('pong');
            }
            else
            {
                const jsonObject: IEngineStopData = JSON.parse(jsonString);
                this.safeEmit('stop', jsonObject);
            }
        });
        ws.on('close', () => {
            this.debuglog('Close request received');
            this.safeEmit('close', 0);
        });
    }

    private safeEmit(event: string, arg: any) {
        if (this._started) {
            this.emit(event, arg);
        } else {
            this._saveEmit.push({event, arg});
        }
    }

    public start() {
        this._started = true;
        this.debuglog('Start accepting messages');
        for (const {event, arg} of this._saveEmit) {
            this.emit(event, arg);
        }
        this._saveEmit = [];
    }

    public async sendCommand(name: string): Promise<void> {
        this.debuglog(`Message sent ${name}`);
        await this._ws.send(name);
    }

    public sendCommandData(name: string, jsonObject: any) {
        this.debuglog(`Message sent ${name} ${JSON.stringify(jsonObject)}`);
        jsonObject.message = name;
        this._ws.send(JSON.stringify(jsonObject));
    }

    public close() {
        this.debuglog('EngineSocket closed');
        this._ws.close();
    }
}
