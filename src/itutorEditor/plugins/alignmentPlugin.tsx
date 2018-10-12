import * as React from 'react';
import { DraftPlugin } from './draft-js-plugins-editor';
import { EditorState, ContentBlock, DefaultDraftBlockRenderMap } from 'draft-js';
import { getSelectedBlocks } from './utils';

export interface AlignmentData {
    alignment?: 'left' | 'center' | 'right' | 'justify';
}

export const createAlignmentPlugin = (): DraftPlugin => {
    return {
        decorators: [{
            strategy: (block, callback) => {
                callback(0, block.getLength());
            },
            component: TestComponent
        }],
        // blockRendererFn: (contentBlock, pluginFns) => {
        //     const entityKey = contentBlock.getEntityAt(0);
        //     const contentState = pluginFns.getEditorState().getCurrentContent();
        //     const alignmentData: AlignmentData = entityKey ? contentState.getEntity(entityKey).getData() : {};
        //     return {
        //         props: {
        //             alignment: alignmentData.alignment
        //         },
        //         component: TestComponent
        //     };
        // }
    };
};

class TestComponent extends React.Component<any> {
    render() {
        console.log('>>HERE', this.props);
        return (
            <span style={{ float: 'right' }}>{this.props.children}</span>
        );
    }
}

export const getAlignmentData = (editorState: EditorState): AlignmentData => {
    const getAlignmentOfBlock = (block: ContentBlock): AlignmentData['alignment'] => {
        const entityKey = block.getEntityAt(0);
        const alignmentData: AlignmentData = entityKey ? contentState.getEntity(entityKey).getData() : {};
        return alignmentData.alignment;
    };

    const contentState = editorState.getCurrentContent();
    const selectedBlocks = getSelectedBlocks(editorState);

    let alignment = getAlignmentOfBlock(selectedBlocks[0]);
    for (let i = 1; i < selectedBlocks.length; i++) {
        const nextAlignment = getAlignmentOfBlock(selectedBlocks[i]);
        if (alignment !== nextAlignment) {
            return {};
        }
    }

    return { alignment };
};

export const setAlignmentData = (editorState: EditorState, data: AlignmentData): EditorState => {
    const selectedBlocks = getSelectedBlocks(editorState);
    const contentState = editorState.getCurrentContent();

    let newContentState = contentState;

    for (const block of selectedBlocks) {
        const entityKey = block.getEntityAt(0);
        if (entityKey) {
            newContentState = newContentState.mergeEntityData(entityKey, { ...data });
        }
    }
    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
    return newEditorState;
};