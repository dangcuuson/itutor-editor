import * as React from 'react';
import {
    EditorState, RichUtils, DraftHandleValue, convertToRaw, convertFromRaw, ContentBlock
} from 'draft-js';
import Editor, { DraftPlugin } from './plugins/draft-js-plugins-editor';
import { createInlineImgPlugin, InsertImgBtn } from './plugins/inlineImagePlugin';
import { createAlignmentPlugin } from './plugins/alignmentPlugin';
import Toolbar from './plugins/toolbar';
import './iTutorEditor.css';

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
            // createAlignmentPlugin(),
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

    blockStyleFn = (contentBlock: ContentBlock) => {
        const blockData = contentBlock.getData();
        const align = blockData.get('alignment');
        if (align === 'left') {
            return 'iTutor-editor-align-left';
        }
        if (align === 'right') {
            return 'iTutor-editor-align-right';
        }
        return '';
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
                    blockStyleFn={this.blockStyleFn}
                />
                <InsertImgBtn
                    editorState={this.state.editorState}
                    onChange={this.onChange}
                />
            </div>
        );
    }
}