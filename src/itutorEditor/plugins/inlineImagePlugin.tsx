import * as React from 'react';
import { EditorState, Modifier, CharacterMetadata, ContentState, SelectionState, DraftHandleValue } from 'draft-js';
import { PluginCreator, PluginCreatorArgs } from './createEditorWithPlugins';

const ENTITY_TYPE = 'INLINE_IMAGE';

export interface ImgData {
    src: string;
}

const imgFileTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/bmp'];

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

const insertImagesFromFiles = (
    creatorArgs: PluginCreatorArgs, files: File[], selection?: SelectionState
): DraftHandleValue => {
    const isImgFiles = files.every(file => imgFileTypes.includes(file.type));
    if (!isImgFiles) {
        return 'not-handled';
    }

    const readImgPromises = files.map(readLocalImage);
    Promise.all(readImgPromises).then(imgsData => {
        let editorState = creatorArgs.getEditorState();
        for (const imgData of imgsData) {
            editorState = insertImg(editorState, imgData, selection);
        }
        creatorArgs.setEditorState(editorState);
    });
    return 'handled';
};

export const createInlineImgPlugin: PluginCreator = (args) => {
    return {
        handleDroppedFiles: (selection, files: File[]) => {
            return insertImagesFromFiles(args, files, selection);
        },
        handlePastedFiles: (files: File[]) => {
            return insertImagesFromFiles(args, files);
        },
        decorators: [{
            strategy: (block, callback, contentState) => {
                const filterFn = (metadata: CharacterMetadata): boolean => {
                    const entityKey = metadata.getEntity();
                    if (!entityKey) {
                        return false;
                    }
                    const entity = contentState.getEntity(entityKey);
                    return !!entity && entity.getType() === ENTITY_TYPE;
                };
                block.findEntityRanges(filterFn, callback);
            },
            component: InlineImgComponent
        }]
    };
};

interface InlineImgProps {
    contentState: ContentState;
    decoratedText: string;
    entityKey: string;
    offsetKey: string;
    getEditorState: () => EditorState;
    setEditorState: (editorState: EditorState) => void;
}
class InlineImgComponent extends React.Component<InlineImgProps> {
    render() {
        const { contentState, entityKey } = this.props;
        const entity = contentState.getEntity(entityKey);
        const data = entity.getData() as ImgData;
        return (
            <span>
                <img
                    src={data.src}
                    style={{ cursor: 'pointer' }}
                />
                {this.props.children}
            </span>
        );
    }
}

export const insertImg = (editorState: EditorState, data: ImgData, selection?: SelectionState): EditorState => {
    let contentState = editorState.getCurrentContent();
    let selectionState = selection || editorState.getSelection();

    if (!selectionState.isCollapsed()) {
        contentState = Modifier.removeRange(contentState, selectionState, 'backward');
        selectionState = contentState.getSelectionAfter();
    }

    const contentStateWithEntity = contentState.createEntity(
        ENTITY_TYPE,
        'IMMUTABLE',
        data
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContentState = Modifier.insertText(
        contentStateWithEntity,
        selectionState,
        ' ',
        undefined,
        entityKey
    );

    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
    return newEditorState;
};