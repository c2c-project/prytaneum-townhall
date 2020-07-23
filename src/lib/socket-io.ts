import socketio from 'socket.io';

const io = socketio();
io.serveClient(false);

export default io;
