import * as React from 'react';
import { DragSource, DragSourceSpec, DragSourceCollector, ConnectDragSource } from 'react-dnd';
import { EditorState, Modifier, CharacterMetadata, ContentState, SelectionState } from 'draft-js';
import { DraftPlugin } from './draft-js-plugins-editor';

const INLINE_IMAGE = 'INLINE_IMAGE';

export interface ImgData {
    src: string;
}

interface ImgDataWithSelection extends ImgData {
    anchorKey: string;
    anchorOffset: number;
    focusKey: string;
    focusOffset: number;
    isBackward: boolean;
    hasFocus: boolean;
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
            component: InlineImgWithDragDrop
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
class InlineImgComponent extends React.Component<InlineImgProps & DragCollectedProps> {
    render() {
        const { contentState, connectDragSource, entityKey } = this.props;
        const entity = contentState.getEntity(entityKey);
        const data = entity.getData() as ImgData;
        return (
            connectDragSource(
                <span>
                    <img
                        src={data.src}
                        style={{ cursor: 'pointer' }}
                    />
                    {this.props.children}
                </span>
            )
        );
    }
}

interface DragObj extends InlineImgProps {
    selectionBeforeDrag: SelectionState;
}
const DragDropType = 'INLINE_IMAGE';
const dragSpec: DragSourceSpec<InlineImgProps, DragObj> = {
    beginDrag: props => {
        return {
            ...props,
            selectionBeforeDrag: props.getEditorState().getSelection()
        };
    },
    endDrag: (props, monitor) => {
        const dragObj = monitor.getItem() as DragObj;
        const { contentState, entityKey, setEditorState, getEditorState, offsetKey } = dragObj;

        const editorState = getEditorState();
        const selectionState = editorState.getSelection();

        const entity = contentState.getEntity(entityKey);
        const block = contentState.getBlockForKey(offsetKey.split('-')[0]);
        const blockKey = block.getKey();
        block.findEntityRanges(charMeta => charMeta.getEntity() === entityKey, (start, end) => {
            const entitySelection = SelectionState
                .createEmpty(blockKey)
                .set('anchorKey', blockKey)
                .set('anchorOffset', start)
                .set('focusKey', blockKey)
                .set('focusOffset', end)
                .set('hasFocus', true) as SelectionState;

            const data = entity.getData() as ImgDataWithSelection;

            const newContentState = Modifier.removeRange(contentState, entitySelection, 'backward');
            const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');

            setEditorState(insertImg(newEditorState, data, selectionState));
        });
    }
};

interface DragCollectedProps {
    connectDragSource: ConnectDragSource;
    isDragging: boolean;
}
const dragCollector: DragSourceCollector<DragCollectedProps> = (connect, monitor) => ({
    connectDragSource: connect.dragSource(),
    isDragging: monitor.isDragging()
});
const InlineImgWithDragDrop = DragSource(DragDropType, dragSpec, dragCollector)(InlineImgComponent);

export const insertImg = (editorState: EditorState, data: ImgData, overrideSelection?: SelectionState): EditorState => {
    let contentState = editorState.getCurrentContent();
    let selectionState = overrideSelection || editorState.getSelection();

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