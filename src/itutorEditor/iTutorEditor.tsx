import * as React from 'react';
import {
    EditorState, RichUtils, DraftHandleValue, convertToRaw, convertFromRaw, ContentBlock
} from 'draft-js';
import Editor, { DraftPlugin } from './plugins/draft-js-plugins-editor';
import { createInlineImgPlugin, insertImg } from './plugins/inlineImagePlugin';
import { createAlignmentPlugin } from './plugins/alignmentPlugin';
import Toolbar from './plugins/toolbar';

interface Props { }

interface State {
    editorState: EditorState;
}

export default class ITutorEditor extends React.Component<Props, State> {
    plugins: DraftPlugin[] = [];

    constructor(props: Props) {
        super(props);
        const savedContent = localStorage.getItem('itutor');
        this.state = {
            editorState:
                savedContent
                    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                    : EditorState.createEmpty()
        };
        this.plugins.push(
            createAlignmentPlugin(),
            createInlineImgPlugin()
        );
    }

    onChange = (editorState: EditorState) => this.setState({ editorState });

    handleRichTextCommand = (command: string, editorState: EditorState): DraftHandleValue => {
        const RichEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (!!RichEditorState) {
            this.setState({ editorState: RichEditorState });
            return 'handled';
        }
        return 'not-handled';
    }

    componentDidUpdate() {
        const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
        localStorage.setItem('itutor', JSON.stringify(rawContent));
    }

    render() {
        return (
            <div>
                <Toolbar
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                />
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    plugins={this.plugins}
                    handleKeyCommand={this.handleRichTextCommand}
                />
                <button
                    // tslint:disable-next-line:max-line-length
                    onClick={() => this.setState({ editorState: insertImg(this.state.editorState, { src: 'https://support.kickofflabs.com/wp-content/uploads/2016/06/300x150.png' }) })}
                    children="Insert dummy image"
                />
            </div>
        );
    }
}