import * as React from 'react';
import {
    EditorState, RichUtils, DraftHandleValue, convertToRaw, convertFromRaw, DefaultDraftBlockRenderMap,
    SelectionState,
    CompositeDecorator
} from 'draft-js';
import { createInlineImgPlugin, insertImg, ImgData, decorators } from './plugins/inlineImagePlugin';
import { createAlignmentPlugin } from './plugins/alignmentPlugin';
import { createColorPlugin } from './plugins/colorPlugin';
import { setFontSize, createFontSizePlugin } from './plugins/fontSizePlugin';
import Toolbar from './plugins/toolbar';
import { createEditorWithPlugins } from './plugins/createEditorWithPlugins';

interface Props { }

interface State {
    editorState: EditorState;
}

const readLocalImage = (file: File): Promise<ImgData> => {
    return new Promise<ImgData>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
            if (!event.target) {
                return reject('Something is wrong with the File uploaded...');
            }
            const imgData: ImgData = {
                // tslint:disable-next-line:no-string-literal
                src: event.target['result']
            };
            resolve(imgData);
        };
        reader.onerror = reject;
        reader.onabort = reject;

        reader.readAsDataURL(file);
    });
};

const EditorWithPlugins = createEditorWithPlugins([
    createAlignmentPlugin,
    createInlineImgPlugin,
    createColorPlugin,
    createFontSizePlugin
]);

export default class ITutorEditor extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        const savedContent = localStorage.getItem('itutor');
        this.state = {
            editorState:
                savedContent
                    // tslint:disable-next-line:max-line-length
                    ? EditorState.createWithContent(convertFromRaw(JSON.parse(savedContent)))
                    : EditorState.createEmpty()
        };
    }

    onChange = (editorState: EditorState) => this.setState({ editorState });

    onFileDrop = async (e: React.DragEvent) => {
        const files = e.dataTransfer.files;
        if (files.length !== 1) {
            return;
        }
        const file = e.dataTransfer.files.item(0)!;
        const acceptedFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];
        if (!acceptedFileTypes.includes(file.type)) {
            return;
        }
        const imgData = await readLocalImage(file);
        this.setState({ editorState: insertImg(this.state.editorState, imgData) });
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
        console.log('>>editorState', this.state.editorState);
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
                {/* <div onDrop={this.onFileDrop}> */}
                <div>
                    <EditorWithPlugins
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        handleKeyCommand={this.handleRichTextCommand}
                    />
                    <button
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                            const editorState = this.state.editorState;
                            this.setState({
                                editorState: setFontSize(editorState, Math.floor(Math.random() * 40) + 10 + '')
                            });
                        }}
                        children="bla"
                    />
                </div>
            </div>
        );
    }
}