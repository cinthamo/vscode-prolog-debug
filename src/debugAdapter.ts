/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/

import { DebugSession } from './debugSession';
import * as Net from 'net';
import { WebSocket, WebSocketServer } from 'ws';
import { EngineSocket } from './engineSocket';

/*
 * debugAdapter.js is the entrypoint of the debug adapter when it runs as a separate process.
 */

// first parse command line arguments to see whether the debug adapter should run as a server
let vsCodePort = 4711;
let writeDebugLog = false;
const args = process.argv.slice(2);
args.forEach(function (val, index, array) {
	const portMatch = /^--server=(\d{4,5})$/.exec(val);
	if (portMatch) {
		vsCodePort = parseInt(portMatch[1], 10);
	}
	else if (val === '--debug') {
		writeDebugLog = true;
	}
});
const enginePort = vsCodePort + 1;

var debugSessions: DebugSession[] = [];
var engineSockets: EngineSocket[] = [];
const wss = new WebSocketServer({ port: enginePort });
wss.on('connection', (ws: WebSocket) => {
		const socket = new EngineSocket(ws, writeDebugLog);
	
		console.log('>> New prolog debugger engine connected');
		ws.on('close', () => {
			console.log('>> Prolog debugger engine disconnected');
			engineSockets = engineSockets.filter(item => item !== socket);
		});

		const session = debugSessions.pop();
		if (session) {
			session.startRuntime(socket);
		} else {
			engineSockets.push(socket);
		}
	});

// start a server that creates a new session for every connection request
console.error(`waiting for debug protocol on port ${vsCodePort} and prolog connections on port ${enginePort}`);
Net.createServer((socket) => {
	const session = new DebugSession();
	session.setRunAsServer(true);
	session.start(socket, socket);

	console.log('>> New visual studio code connected');
	socket.on('end', () => {
		console.log('>> Visual studio code disconnected');
		debugSessions = debugSessions.filter(item => item !== session);
	});

	const engine = engineSockets.pop();
	if (engine) {
		session.startRuntime(engine);
	} else {
		debugSessions.push(session);
	}
}).listen(vsCodePort);
