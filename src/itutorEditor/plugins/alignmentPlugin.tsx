import * as React from 'react';
import { DraftPlugin } from './draft-js-plugins-editor';
import { EditorState, ContentBlock, Modifier } from 'draft-js';
import { getSelectedBlocks } from './utils';
import * as Immutable from 'immutable';

export type Alignment = 'left' | 'right' | 'center' | 'justify';

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

export const getAlignment = (editorState: EditorState): Alignment | undefined => {
    const getAlignmentOfBlock = (block: ContentBlock): Alignment => {
        const blockData = block.getData();
        const blockAlignment = blockData.get('alignment');
        return blockAlignment || 'left';
    };

    const selectedBlocks = getSelectedBlocks(editorState);

    let alignment = getAlignmentOfBlock(selectedBlocks[0]);
    for (let i = 1; i < selectedBlocks.length; i++) {
        const nextAlignment = getAlignmentOfBlock(selectedBlocks[i]);
        if (alignment !== nextAlignment) {
            return undefined;
        }
    }

    return alignment;
};

export const setAlignment = (editorState: EditorState, alignment: Alignment): EditorState => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

    const newContentState = Modifier.mergeBlockData(
        contentState, selectionState, Immutable.Map({ 'alignment': alignment })
    );
    const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
    return newEditorState;
};