import * as React from 'react';
import ITutorEditor from './itutorEditor/iTutorEditor';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

export default class App extends React.Component<{}, { editorState: EditorState, editorState2: EditorState }> {
    constructor(props: {}) {
        super(props);

        const savedContent = localStorage.getItem('itutor');
        this.state = {
            editorState: savedContent
                ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                : EditorState.createEmpty(),
            editorState2: savedContent
                ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                : EditorState.createEmpty(),
        };
    }

    handleChange = editorState => this.setState({ editorState });

    componentDidUpdate() {
        const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
        localStorage.setItem('itutor', JSON.stringify(rawContent));
    }

    render() {
        return (
            <div>
                <button onClick={() => localStorage.clear()}>Clear Local storage</button>
                <br />
                <br />
                <ITutorEditor
                    editorState={this.state.editorState}
                    onChange={this.handleChange}
                />
                <br />
                <br />
                <br />
                <ITutorEditor
                    editorState={this.state.editorState2}
                    readonly={true}
                />
            </div>
        );
    }
}