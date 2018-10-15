import * as React from 'react';
import {
    EditorState, RichUtils, DraftHandleValue, convertToRaw, convertFromRaw,
} from 'draft-js';
import { createEditorWithPlugins } from './plugins/createEditorWithPlugins';
import { createInlineImgPlugin } from './plugins/inlineImagePlugin';
import { createAlignmentPlugin } from './plugins/alignmentPlugin';
import { createColorPlugin } from './plugins/colorPlugin';
import { createFontSizePlugin } from './plugins/fontSizePlugin';
import { createListItemPlugin } from './plugins/listItemPlugins';
import Toolbar from './plugins/toolbar';

interface Props { 
    readonly?: boolean;
}

interface State {
    editorState: EditorState;
}

const EditorWithPlugins = createEditorWithPlugins([
    createAlignmentPlugin,
    createInlineImgPlugin,
    createColorPlugin,
    createFontSizePlugin,
    createListItemPlugin
]);

export default class ITutorEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const savedContent = localStorage.getItem('itutor');
        this.state = {
            editorState:
                savedContent
                    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                    : EditorState.createEmpty()
        };
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
                <div>
                    <EditorWithPlugins
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        handleKeyCommand={this.handleRichTextCommand}
                    />
                </div>
            </div>
        );
    }
}