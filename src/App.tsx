import * as React from 'react';
import ITutorEditor from './itutorEditor/iTutorEditor';

export default class App extends React.Component {
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