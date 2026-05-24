import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { AlertCircle, Info, Plus } from 'lucide-react';

export default function HighlightedBlockComponent(props) {
  const { node, getPos, editor } = props;
  const { type, isHidden } = node.attrs;

  if (isHidden) {
    return null;
  }

  const isWarning = type === 'warning';
  
  // Custom styles extracted from node attributes
  const customStyles = {
    padding: `${node.attrs.paddingTop}px ${node.attrs.paddingRight}px ${node.attrs.paddingBottom}px ${node.attrs.paddingLeft}px`,
    margin: `${node.attrs.marginTop}px ${node.attrs.marginRight}px ${node.attrs.marginBottom}px ${node.attrs.marginLeft}px`,
    borderRadius: `${node.attrs.borderRadiusTopLeft}px ${node.attrs.borderRadiusTopRight}px ${node.attrs.borderRadiusBottomRight}px ${node.attrs.borderRadiusBottomLeft}px`,
    textAlign: node.attrs.textAlign,
    color: node.attrs.textColor,
    backgroundColor: isWarning ? '#FEF3C7' : '#EFF6FF', // Default BG colors, overridden by inline
    opacity: node.attrs.opacity,
    boxShadow: node.attrs.boxShadow,
    border: `${node.attrs.borderWidth}px ${node.attrs.borderStyle} ${node.attrs.borderColor}`,
    borderLeftWidth: isWarning ? '4px' : '4px',
    borderLeftColor: isWarning ? '#F59E0B' : '#3B82F6',
    borderLeftStyle: 'solid',
    cursor: node.attrs.cursor,
    zIndex: node.attrs.zIndex,
    width: node.attrs.width !== null ? `${node.attrs.width}px` : 'auto',
    height: node.attrs.height !== null ? `${node.attrs.height}px` : 'auto',
    minWidth: node.attrs.minWidth !== null ? `${node.attrs.minWidth}px` : 'auto',
    maxWidth: node.attrs.maxWidth !== null ? `${node.attrs.maxWidth}px` : '100%',
    minHeight: node.attrs.minHeight !== null ? `${node.attrs.minHeight}px` : 'auto',
    maxHeight: node.attrs.maxHeight !== null ? `${node.attrs.maxHeight}px` : 'auto',
  };

  // If colors are customized through the right panel, use them
  if (node.attrs.bgColor !== '#ffffff') {
    customStyles.backgroundColor = node.attrs.bgColor;
  }

  const addParagraphBefore = () => {
    if (typeof getPos === 'function') {
      editor.chain().insertContentAt(getPos(), { type: 'paragraph' }).focus(getPos()).run();
    }
  };

  return (
    <NodeViewWrapper
      className="highlighted-block-wrapper my-4 relative group tiptap-block"
      data-type="highlighted-block"
      style={customStyles}
    >
      {/* Insert Paragraph Before Button */}
      <div 
        contentEditable={false} 
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <button 
           onClick={addParagraphBefore}
           className="bg-indigo-600 hover:bg-blue-600 text-white rounded px-2 py-1 shadow-sm flex items-center justify-center transition-colors text-xs font-semibold"
           title="Add line above"
        >
          <Plus size={14} className="mr-1" /> Add Above
        </button>
      </div>

      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {isWarning ? (
            <AlertCircle className="w-6 h-6 text-amber-500" />
          ) : (
            <Info className="w-6 h-6 text-indigo-600" />
          )}
        </div>
        <div className="flex-grow">
          <NodeViewContent className="content" />
        </div>
      </div>
    </NodeViewWrapper>
  );
}
