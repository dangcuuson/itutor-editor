import * as React from 'react';
import * as _ from 'lodash';
import * as ClassNames from 'classnames';
import { SketchPicker } from 'react-color';
import { EditorState, RichUtils, DraftBlockType } from 'draft-js';
import {
    createStyles, withStyles, WithStyles, Theme, NativeSelect, FormControl,
    InputLabel, Input
} from '@material-ui/core';
import IconButton, { IconButtonProps } from '@material-ui/core/IconButton';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import {
    FormatAlignLeft, FormatAlignCenter, FormatAlignRight, FormatColorText,
    FormatListBulleted, FormatListNumbered, FormatClear, Undo, Redo
} from '@material-ui/icons';
import { getFontSize, setFontSize } from './fontSizePlugin';
import { getAlignment, setAlignment, Alignment } from './alignmentPlugin';
import { getColor, setColor } from './colorPlugin';
import { clearAllInlineStyle } from './utils';

interface OwnProps {
    editorState: EditorState;
    onChange: (editorState: EditorState) => void;
}

type Props = OwnProps & WithStyles<typeof styles>;

interface State {
    showColorPicker?: boolean;
}

class Toolbar extends React.Component<Props, State> {
    colorPickerWrapperRef: HTMLElement | null;
    colorPickerBtnRef: HTMLElement | null;

    constructor(props: Props) {
        super(props);
        this.state = {};
    }

    toggleInlineStyle = (style: 'BOLD' | 'ITALIC' | 'UNDERLINE') => {
        const newEditorState = RichUtils.toggleInlineStyle(this.props.editorState, style);
        this.props.onChange(newEditorState);
    }

    setAlignment = (alignment: Alignment) => {
        const newEditorState = setAlignment(this.props.editorState, alignment);
        this.props.onChange(newEditorState);
    }

    setColor = (color: string) => {
        const newEditorState = setColor(this.props.editorState, color);
        this.props.onChange(newEditorState);
    }

    setFontSize = (fontSize: string) => {
        const newEditorState = setFontSize(this.props.editorState, fontSize);
        this.props.onChange(newEditorState);
    }

    setBlockType = (blockType: DraftBlockType) => {
        const newEditorState = RichUtils.toggleBlockType(this.props.editorState, blockType);
        this.props.onChange(newEditorState);
    }

    clearInlineStyle = () => {
        const newEditorState = clearAllInlineStyle(this.props.editorState);
        this.props.onChange(newEditorState);
    }

    undo = () => {
        this.props.onChange(EditorState.undo(this.props.editorState));
    }

    redo = () => {
        this.props.onChange(EditorState.redo(this.props.editorState));
    }

    preventBubblingUp = (event) => { event.preventDefault(); };

    handleWindowClick = (event: MouseEvent) => {
        if (!this.colorPickerBtnRef || !this.colorPickerWrapperRef) {
            return;
        }

        if (this.colorPickerBtnRef.contains(event.target as any)) {
            return;
        }

        if (!this.colorPickerWrapperRef.contains(event.target as any)) {
            this.setState({ showColorPicker: false });
        }
    }

    renderIconBtn(groupValues: any[], props: IconButtonProps) {
        const { classes } = this.props;
        const toggled = groupValues.includes(props.value);
        const classNames = ClassNames({
            [classes.btn]: true,
            [classes.btnToggled]: toggled
        });
        return (
            <IconButton
                {...props}
                className={classNames}
                onMouseDown={this.preventBubblingUp}
            />
        );
    }

    decorateBtn = (element: React.ReactElement<IconButtonProps>, toggled?: boolean) => {
        const { classes } = this.props;
        const className = ClassNames({
            [classes.btn]: true,
            [classes.btnToggled]: toggled
        });
        return React.cloneElement(element, { className, onMouseDown: this.preventBubblingUp });
    }

    componentDidMount() {
        window.addEventListener('click', this.handleWindowClick);
    }

    componentWillUnmount() {
        window.removeEventListener('click', this.handleWindowClick);
    }

    render() {
        const { editorState, classes } = this.props;
        const inlineStyles = editorState.getCurrentInlineStyle().toArray();
        const alignment = getAlignment(editorState);
        const color = getColor(editorState);
        const blockType = RichUtils.getCurrentBlockType(editorState);
        const fontSize = getFontSize(editorState);

        return (
            <div className={classes.root}>
                <div className={classes.btnGroup}>
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.toggleInlineStyle('BOLD')}
                            children={<FormatBold />}
                        />,
                        inlineStyles.includes('BOLD')
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.toggleInlineStyle('ITALIC')}
                            children={<FormatItalic />}
                        />,
                        inlineStyles.includes('ITALIC')
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.toggleInlineStyle('UNDERLINE')}
                            children={<FormatUnderlined />}
                        />,
                        inlineStyles.includes('UNDERLINE')
                    )}
                </div>

                <div className={classes.btnGroup}>
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.setAlignment('left')}
                            children={<FormatAlignLeft />}
                        />,
                        alignment === 'left'
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.setAlignment('center')}
                            children={<FormatAlignCenter />}
                        />,
                        alignment === 'center'
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.setAlignment('right')}
                            children={<FormatAlignRight />}
                        />,
                        alignment === 'right'
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.setBlockType('ordered-list-item')}
                            children={<FormatListNumbered />}
                        />,
                        blockType === 'ordered-list-item'
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={() => this.setBlockType('unordered-list-item')}
                            children={<FormatListBulleted />}
                        />,
                        blockType === 'unordered-list-item'
                    )}
                </div>
                <div className={classes.btnGroup}>
                    <FormControl>
                        <InputLabel>Font Size</InputLabel>
                        <NativeSelect
                            value={fontSize}
                            onChange={e => {
                                const newFontSize = e.currentTarget.value;
                                if (!newFontSize) {
                                    return;
                                }
                                this.setFontSize(newFontSize);
                            }}
                            style={{ width: '75px' }}
                            input={<Input />}
                        >
                            <option value={''} />
                            {_.range(10, 71).map(size => <option key={size} value={size} children={size} />)}
                        </NativeSelect>
                    </FormControl>
                    <IconButton
                        value="color"
                        buttonRef={r => { this.colorPickerBtnRef = r; }}
                        className={classes.btn}
                        onMouseDown={this.preventBubblingUp}
                        onClick={e => this.setState({ showColorPicker: !this.state.showColorPicker })}
                        children={<FormatColorText style={{ color }} />}
                    />
                    {!!this.state.showColorPicker && (
                        <div
                            ref={r => { this.colorPickerWrapperRef = r; }}
                            style={{ position: 'absolute', zIndex: 1 }}
                        >
                            <SketchPicker
                                color={color}
                                onChange={result => this.setColor(result.hex)}
                            />
                        </div>
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={this.clearInlineStyle}
                            children={<FormatClear />}
                        />
                    )}
                </div>
                <div className={`${classes.btnGroup} ${classes.btnGroupRight}`}>
                    {this.decorateBtn(
                        <IconButton
                            onClick={this.undo}
                            disabled={editorState.getUndoStack().size === 0}
                            children={<Undo />}
                        />
                    )}
                    {this.decorateBtn(
                        <IconButton
                            onClick={this.redo}
                            disabled={editorState.getRedoStack().size === 0}
                            children={<Redo />}
                        />
                    )}
                </div>
            </div >
        );
    }
}

const styles = (theme: Theme) => createStyles({
    root: {
        display: 'flex',
        alignItems: 'center'
    },
    btn: {
        borderRadius: 0
    },
    btnToggled: {
        backgroundColor: theme.palette.grey['400']
    },
    btnGroup: {
        margin: `0 ${theme.spacing.unit * 2}px`,
        paddingTop: theme.spacing.unit + 'px',
        background: theme.palette.background.default
    },
    btnGroupRight: {
        marginLeft: 'auto'
    }
});

export default withStyles(styles)(Toolbar);