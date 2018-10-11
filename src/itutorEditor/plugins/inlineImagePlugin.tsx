import * as React from 'react';
import { EditorState, Modifier, CharacterMetadata } from 'draft-js';
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
            component: (props) => {
                const entity = props.contentState.getEntity(props.entityKey);
                return (
                    <span>
                        <img src={entity.data.src} style={{ width: '10%' }} />
                        {props.children}
                    </span>
                );
            }
        }]
    };
};

export const insertImgFn = (editorState: EditorState, data: ImgData): EditorState => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    // remove current selection
    const contentStateAfterRemoval = Modifier.removeRange(contentState, selectionState, 'backward');
    const targetSelection = contentStateAfterRemoval.getSelectionAfter();

    const contentStateWithEntity = contentStateAfterRemoval.createEntity(
        INLINE_IMAGE,
        'IMMUTABLE',
        data
    );
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const newContentState = Modifier.insertText(
        contentStateWithEntity,
        targetSelection,
        ' ',
        undefined,
        entityKey
    );

    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
    return newEditorState;
};