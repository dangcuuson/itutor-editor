import * as React from 'react';
import HTML5Backend from 'react-dnd-html5-backend';
import { DragDropContext } from 'react-dnd';
import ITutorEditor from './itutorEditor/iTutorEditor';

class App extends React.Component {
    render() {
        return (
            <div>
                <ITutorEditor />
                <br />
                <br />
                <button onClick={() => localStorage.clear()}>Clear Local storage</button>
            </div>
        );
    }
}

export default DragDropContext(HTML5Backend)(App);