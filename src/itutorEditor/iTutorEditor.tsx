import * as React from 'react';
import {
    EditorState, RichUtils, DraftHandleValue, convertToRaw, convertFromRaw
} from 'draft-js';
import Editor, { DraftPlugin } from './plugins/draft-js-plugins-editor';
import { createInlineImgPlugin, insertImgFn, ImgData } from './plugins/inlineImagePlugin';

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
        this.plugins.push(createInlineImgPlugin());
    }

    onChange = (editorState: EditorState) => this.setState({ editorState });

    insertImg = (data: ImgData) => {
        this.setState({ editorState: insertImgFn(this.state.editorState, data) });
    }

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
                <Editor
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                    plugins={this.plugins}
                    handleKeyCommand={this.handleRichTextCommand}
                />
                <button
                    // tslint:disable-next-line:max-line-length
                    onClick={() => this.insertImg({ src: 'https://cdn.vox-cdn.com/thumbor/th5YNVqlkHqkz03Va5RPOXZQRhA=/0x0:2040x1360/1200x800/filters:focal(857x517:1183x843)/cdn.vox-cdn.com/uploads/chorus_image/image/57358643/jbareham_170504_1691_0020.0.0.jpg' })}
                    children="Insert dummy img"
                />
            </div>
        );
    }
}