import * as React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import ITutorEditor from './itutorEditor/iTutorEditor';

class App extends React.Component {
    render() {
        return (
            <div>
                <button onClick={() => localStorage.clear()}>Clear Local storage</button>
                <br />
                <br />
                <ITutorEditor />
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(App);