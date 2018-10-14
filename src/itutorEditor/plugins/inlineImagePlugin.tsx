import * as React from 'react';
import { EditorState, Modifier, CharacterMetadata, ContentState } from 'draft-js';
import { DraftPlugin } from './draft-js-plugins-editor';
const INLINE_IMAGE = 'INLINE_IMAGE';

export interface ImgData {
    src: string;
}

export const createInlineImgPlugin = (): DraftPlugin => {
    return {
        decorators: [{
            strategy: (block, callback, contentState) => {
                const filterFn = (metadata: CharacterMetadata): boolean => {
                    const entityKey = metadata.getEntity();
                    if (!entityKey) {
                        return false;
                    }
                    const entity = contentState.getEntity(entityKey);
                    return !!entity && entity.getType() === INLINE_IMAGE;
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

export const insertImg = (editorState: EditorState, data: ImgData): EditorState => {
    let contentState = editorState.getCurrentContent();
    let selectionState = editorState.getSelection();

    if (!selectionState.isCollapsed()) {
        contentState = Modifier.removeRange(contentState, selectionState, 'backward');
        selectionState = contentState.getSelectionAfter();
    }

    const contentStateWithEntity = contentState.createEntity(
        INLINE_IMAGE,
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