import React from 'react';
import {render} from 'react-dom';
import Video from './Video.jsx';
import Whiteboard from './Whiteboard.jsx';
import Chat from './Chat.jsx';
const io = require('socket.io-client');


class App extends React.Component {
	
    render () {
		return (
			<div>
				<Video />
				<Whiteboard />
				<Chat />
			</div>
		);
	}
}



render(<App/>, document.getElementById('app'));