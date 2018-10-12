import * as React from 'react';
import { DragSource, DragSourceSpec, DragSourceCollector, ConnectDragSource } from 'react-dnd';
import { EditorState, Modifier, CharacterMetadata, ContentState, SelectionState } from 'draft-js';
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
            component: InlineImgWithDragDrop
        }]
    };
};

interface InlineImgProps {
    contentState: ContentState;
    decoratedText: string;
    entityKey: string;
    offetKey: string;
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
        const { contentState, entityKey, setEditorState, getEditorState, selectionBeforeDrag } = dragObj;

        const editorState = getEditorState();

        const entity = contentState.getEntity(entityKey);
        const data = entity.getData() as ImgData;
        const newContentState = Modifier.removeRange(contentState, selectionBeforeDrag, 'forward');
        const newEditorState = EditorState.push(editorState, newContentState, 'change-block-data');
        
        setEditorState(insertImg(newEditorState, data));
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

export const insertImg = (editorState: EditorState, data: ImgData): EditorState => {
    const contentState = editorState.getCurrentContent();
    const selectionState = editorState.getSelection();

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