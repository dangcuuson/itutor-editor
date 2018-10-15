import * as React from 'react';
import * as classNames from 'classnames';
import { Theme, withStyles, WithStyles, createStyles, Paper } from '@material-ui/core';
import {
    Editor, EditorState, RichUtils, DraftHandleValue, convertToRaw,
    convertFromRaw, getDefaultKeyBinding, KeyBindingUtil
} from 'draft-js';
import { createEditorWithPlugins } from './plugins/createEditorWithPlugins';
import { createInlineImgPlugin } from './plugins/inlineImagePlugin';
import { createAlignmentPlugin } from './plugins/alignmentPlugin';
import { createColorPlugin } from './plugins/colorPlugin';
import { createFontSizePlugin } from './plugins/fontSizePlugin';
import { createListItemPlugin } from './plugins/listItemPlugins';
import Toolbar from './plugins/toolbar';

interface OwnProps {
    readonly?: boolean;
}

type Props = OwnProps & WithStyles<typeof styles>;

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

class ITutorEditor extends React.Component<Props, State> {
    editorRef: React.RefObject<Editor>;

    constructor(props: Props) {
        super(props);
        const savedContent = localStorage.getItem('itutor');
        this.state = {
            editorState:
                savedContent
                    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                    : EditorState.createEmpty()
        };
        this.editorRef = React.createRef();
    }

    onChange = (editorState: EditorState) => {
        if (this.props.readonly) {
            return;
        }
        this.setState({ editorState });
    }

    handleRichTextCommand = (command: string, editorState: EditorState): DraftHandleValue => {
        const newEditorState = RichUtils.handleKeyCommand(editorState, command);
        if (!!newEditorState) {
            this.onChange(newEditorState);
            return 'handled';
        }
        return 'not-handled';
    }

    keyBindingFn = (e: React.KeyboardEvent): string | null => {

        let keyBindingResult: string | null = getDefaultKeyBinding(e);

        // default keybinding treat ctrl/cmd + y as 'secondary-paste'
        // overwrite it to redo
        if (keyBindingResult === 'secondary-paste') {
            // ctrl/cmd + y => redo
            if (e.key === 'y' && KeyBindingUtil.hasCommandModifier(e)) {
                keyBindingResult = 'redo';
            }
        }
        
        return keyBindingResult;
    }

    focus = () => {
        if (!this.editorRef.current) {
            return;
        }

        this.editorRef.current.focus();
    }

    // when drag & drop files to editor, user may accidentally
    // drop it outside the editor, causing the windows to open the file
    preventAccientDrop = (e: DragEvent) => e.preventDefault();

    componentDidMount() {
        window.addEventListener('dragover', this.preventAccientDrop, false);
        window.addEventListener('drop', this.preventAccientDrop, false);
    }

    componentWillUnmount() {
        window.removeEventListener('dragover', this.preventAccientDrop, false);
        window.removeEventListener('drop', this.preventAccientDrop, false);
    }

    componentDidUpdate() {
        const rawContent = convertToRaw(this.state.editorState.getCurrentContent());
        localStorage.setItem('itutor', JSON.stringify(rawContent));
    }

    render() {
        const { readonly, classes } = this.props;
        const EditorWrapper = readonly ? 'div' : Paper;
        return (
            <div
                className={classNames({
                    [classes.root]: true,
                    [classes.readonly]: !!readonly
                })}
            >
                {!readonly && (
                    <Toolbar
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                    />
                )}
                <EditorWrapper
                    className={classNames({
                        [classes.editor]: true,
                        [classes.readonly]: !!readonly
                    })}
                    onClick={this.focus}
                >
                    <EditorWithPlugins
                        editorRef={this.editorRef}
                        editorState={this.state.editorState}
                        handleKeyCommand={this.handleRichTextCommand}
                        keyBindingFn={this.keyBindingFn}
                        onChange={this.onChange}
                        readOnly={readonly}
                    />
                </EditorWrapper>
            </div>
        );
    }
}

const styles = (theme: Theme) => createStyles({
    root: {
        backgroundColor: theme.palette.grey[50],
        border: `1px solid ${theme.palette.grey[300]}`,
        fontFamily: `'Roboto', sans-serif`,
        fontSize: 14,
    },
    editor: {
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        cursor: 'text',
        margin: theme.spacing.unit * 2,
        padding: theme.spacing.unit * 2,
        minHeight: 200,
        position: 'relative'
    },
    readonly: {
        border: 'none',
        minHeight: 'initial',
        backgroundColor: 'transparent',
        padding: 0,
        marginBottom: 0,
    }
});

export default withStyles(styles)(ITutorEditor);