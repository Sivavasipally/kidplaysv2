import { useEffect, useRef } from 'react';
import * as Blockly from 'blockly';
import { registerScratchBlocks } from './blockDefinitions';
import { defaultBlocksXml, scratchToolbox } from './toolbox';

type BlocklyWorkspaceProps = {
  spriteId: string;
  blocksXml?: string;
  onChange: (xml: string) => void;
  onSelectBlock?: (blockType?: string) => void;
};

export function BlocklyWorkspace({
  spriteId,
  blocksXml,
  onChange,
  onSelectBlock,
}: BlocklyWorkspaceProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<number>();

  useEffect(() => {
    registerScratchBlocks();

    if (!hostRef.current) {
      return undefined;
    }

    const workspace = Blockly.inject(hostRef.current, {
      toolbox: scratchToolbox as Blockly.utils.toolbox.ToolboxDefinition,
      trashcan: true,
      scrollbars: true,
      zoom: {
        controls: true,
        wheel: true,
        startScale: 0.88,
        maxScale: 1.5,
        minScale: 0.55,
        scaleSpeed: 1.08,
      },
      move: {
        scrollbars: true,
        drag: true,
        wheel: true,
      },
      renderer: 'zelos',
      grid: {
        spacing: 24,
        length: 2,
        colour: '#DDE7F3',
        snap: true,
      },
    });

    const xmlToLoad = blocksXml?.trim() || defaultBlocksXml;
    try {
      const dom = Blockly.utils.xml.textToDom(xmlToLoad);
      Blockly.Xml.domToWorkspace(dom, workspace);
    } catch (error) {
      console.warn('Unable to load blocks XML, using starter blocks.', error);
      const dom = Blockly.utils.xml.textToDom(defaultBlocksXml);
      Blockly.Xml.domToWorkspace(dom, workspace);
    }

    const listener = (event: Blockly.Events.Abstract) => {
      if (event.isUiEvent) {
        const selectedType = (Blockly.Events as any).SELECTED;
        if ((event as any).type === selectedType) {
          const blockId = (event as any).newElementId as string | undefined;
          onSelectBlock?.(blockId ? workspace.getBlockById(blockId)?.type : undefined);
        }
        return;
      }

      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => {
        const dom = Blockly.Xml.workspaceToDom(workspace);
        onChange(Blockly.Xml.domToText(dom));
      }, 300);
    };

    workspace.addChangeListener(listener);
    Blockly.svgResize(workspace);

    return () => {
      window.clearTimeout(timeoutRef.current);
      workspace.removeChangeListener(listener);
      workspace.dispose();
    };
  }, [spriteId]);

  return <div ref={hostRef} className="h-full min-h-[420px] w-full overflow-hidden rounded-[8px] sm:min-h-[520px] xl:min-h-0" />;
}
