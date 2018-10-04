import * as React from 'react';
import {
    EditorState, convertToRaw, getDefaultKeyBinding,
    RichUtils, DraftHandleValue, ContentBlock
} from 'draft-js';
import Editor from './draft-js-plugins-editor';
import { createMyPlugin } from './myPlugins';
import createImagePlugin from 'draft-js-image-plugin';

interface Props { }

interface State {
    editorState: EditorState;
}

export default class ITutorEditor extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty()
        };
    }

    onChange = (editorState: EditorState) => this.setState({ editorState });

    handleKeyCommand = (command: string, editorState: EditorState): DraftHandleValue => {
        const RichEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (!!RichEditorState) {
            this.setState({ editorState: RichEditorState });
            return 'handled';
        }
        return 'not-handled';
    }

    blockRendererFn = (block: ContentBlock) => {
        return null;
    }

    componentDidUpdate() {
        console.log(this.state.editorState.getCurrentContent());
        console.log(convertToRaw(this.state.editorState.getCurrentContent()));
    }

    render() {
        return (
            <Editor
                editorState={this.state.editorState}
                onChange={this.onChange}
                plugins={[createMyPlugin()]}
            />
        );
    }
}