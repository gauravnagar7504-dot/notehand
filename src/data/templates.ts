import type { PageElement } from '../types';
import { generateId } from '../utils/storage';

export interface PageTemplate {
  id: string;
  name: string;
  description: string;
  paperStyleType: 'plain' | 'ruled' | 'college-ruled' | 'narrow-ruled' | 'graph' | 'dot-grid' | 'engineering' | 'vintage' | 'legal-pad' | 'pastel-blue' | 'pastel-pink';
  elements: () => PageElement[];
}

export const PAGE_TEMPLATES: PageTemplate[] = [
  {
    id: 't-blank',
    name: 'Blank Page',
    description: 'A clean, empty page for freeform drawing or writing.',
    paperStyleType: 'plain',
    elements: () => []
  },
  {
    id: 't-ruled',
    name: 'Ruled Notebook',
    description: 'Standard ruled sheet with left margin line.',
    paperStyleType: 'ruled',
    elements: () => []
  },
  {
    id: 't-cornell',
    name: 'Cornell Study Notes',
    description: 'The standard layout for effective college note-taking, containing a cue column and a summary section.',
    paperStyleType: 'college-ruled',
    elements: () => [
      // Vertical Cue divider line (x = 220)
      {
        id: generateId(),
        type: 'shape',
        shapeType: 'line',
        x: 210,
        y: 40,
        width: 1,
        height: 650,
        rotation: 0,
        opacity: 0.8,
        layerOrder: 1,
        locked: true,
        strokeWidth: 2,
        strokeColor: '#E8A7A1', // pink margin divider
        fillColor: 'transparent',
        roughness: 1.1
      },
      // Horizontal Summary divider line (y = 550)
      {
        id: generateId(),
        type: 'shape',
        shapeType: 'line',
        x: 40,
        y: 560,
        width: 680,
        height: 1,
        rotation: 0,
        opacity: 0.8,
        layerOrder: 2,
        locked: true,
        strokeWidth: 2,
        strokeColor: '#C0D5E4', // blue rule color
        fillColor: 'transparent',
        roughness: 1
      },
      // Title "Cues / Key Terms"
      {
        id: generateId(),
        type: 'text',
        x: 60,
        y: 35,
        width: 140,
        height: 40,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 3,
        locked: false,
        content: 'Keywords',
        fontSize: 20,
        color: '#B45309', // Brownish
        fontStyle: 'lecture-notes',
        penType: 'fineliner',
        lineSpacing: 1.2,
        slant: 0,
        jitter: 0.2,
        bold: true,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      // Title "Notes"
      {
        id: generateId(),
        type: 'text',
        x: 230,
        y: 35,
        width: 200,
        height: 40,
        rotation: 0.5,
        opacity: 1,
        layerOrder: 4,
        locked: false,
        content: 'Class Lecture Notes',
        fontSize: 22,
        color: '#1E293B',
        fontStyle: 'neat-student',
        penType: 'gel-pen',
        lineSpacing: 1.2,
        slant: 1,
        jitter: 0.3,
        bold: true,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      },
      // Title "Summary"
      {
        id: generateId(),
        type: 'text',
        x: 60,
        y: 565,
        width: 200,
        height: 40,
        rotation: -1,
        opacity: 1,
        layerOrder: 5,
        locked: false,
        content: 'Summary (Review & Synthesize)',
        fontSize: 20,
        color: '#059669', // Greenish
        fontStyle: 'casual',
        penType: 'gel-pen',
        lineSpacing: 1.2,
        slant: 2,
        jitter: 0.3,
        bold: true,
        underlineType: 'none',
        underlineColor: '',
        highlightColor: 'transparent',
        alignment: 'left'
      }
    ]
  },
  {
    id: 't-mindmap',
    name: 'Mind Map Diagram',
    description: 'Mind mapping preset with a central hub and branching nodes.',
    paperStyleType: 'dot-grid',
    elements: () => {
      const elCenterId = generateId();
      const elBranch1Id = generateId();
      const elBranch2Id = generateId();
      const elBranch3Id = generateId();

      return [
        // Central Node
        {
          id: elCenterId,
          type: 'shape',
          shapeType: 'circle',
          x: 280,
          y: 240,
          width: 180,
          height: 100,
          rotation: -1,
          opacity: 1,
          layerOrder: 1,
          locked: false,
          strokeWidth: 3,
          strokeColor: '#3B82F6', // Blue
          fillColor: '#DBEAFE',
          roughness: 1.5,
          label: 'Central Topic'
        },
        // Branch 1: Top Left
        {
          id: elBranch1Id,
          type: 'shape',
          shapeType: 'rect',
          x: 80,
          y: 90,
          width: 140,
          height: 60,
          rotation: 2,
          opacity: 1,
          layerOrder: 2,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#EF4444', // Red
          fillColor: '#FEE2E2',
          roughness: 1.2,
          label: 'Idea A'
        },
        // Branch 2: Top Right
        {
          id: elBranch2Id,
          type: 'shape',
          shapeType: 'rect',
          x: 520,
          y: 90,
          width: 140,
          height: 60,
          rotation: -2,
          opacity: 1,
          layerOrder: 3,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#10B981', // Green
          fillColor: '#D1FAE5',
          roughness: 1.1,
          label: 'Idea B'
        },
        // Branch 3: Bottom Center
        {
          id: elBranch3Id,
          type: 'shape',
          shapeType: 'rect',
          x: 300,
          y: 450,
          width: 140,
          height: 60,
          rotation: 0.5,
          opacity: 1,
          layerOrder: 4,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#D97706', // Yellow
          fillColor: '#FEF3C7',
          roughness: 1.3,
          label: 'Idea C'
        },
        // Connector 1: Center to Branch 1
        {
          id: generateId(),
          type: 'shape',
          shapeType: 'arrow',
          x: 270,
          y: 235,
          width: -80,
          height: -70,
          rotation: 0,
          opacity: 0.8,
          layerOrder: 5,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#64748B',
          fillColor: 'transparent',
          roughness: 1.4
        },
        // Connector 2: Center to Branch 2
        {
          id: generateId(),
          type: 'shape',
          shapeType: 'arrow',
          x: 470,
          y: 235,
          width: 80,
          height: -70,
          rotation: 0,
          opacity: 0.8,
          layerOrder: 6,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#64748B',
          fillColor: 'transparent',
          roughness: 1.4
        },
        // Connector 3: Center to Branch 3
        {
          id: generateId(),
          type: 'shape',
          shapeType: 'arrow',
          x: 370,
          y: 350,
          width: 0,
          height: 90,
          rotation: 0,
          opacity: 0.8,
          layerOrder: 7,
          locked: false,
          strokeWidth: 2,
          strokeColor: '#64748B',
          fillColor: 'transparent',
          roughness: 1.4
        }
      ];
    }
  },
  {
    id: 't-formula',
    name: 'Formula Sheet',
    description: 'Double column page with custom formula boxes and margin notes.',
    paperStyleType: 'graph',
    elements: () => [
      // Title
      {
        id: generateId(),
        type: 'text',
        x: 60,
        y: 40,
        width: 620,
        height: 50,
        rotation: -0.5,
        opacity: 1,
        layerOrder: 1,
        locked: false,
        content: 'DEFINITIONS & FORMULAS',
        fontSize: 26,
        color: '#E11D48', // Crimson red
        fontStyle: 'lecture-notes',
        penType: 'marker',
        lineSpacing: 1.2,
        slant: 0,
        jitter: 0.2,
        bold: true,
        underlineType: 'hand-drawn',
        underlineColor: '#F43F5E',
        highlightColor: 'transparent',
        alignment: 'center'
      },
      // Center dividing vertical line
      {
        id: generateId(),
        type: 'shape',
        shapeType: 'line',
        x: 375,
        y: 110,
        width: 1,
        height: 540,
        rotation: 0,
        opacity: 0.6,
        layerOrder: 2,
        locked: true,
        strokeWidth: 1.5,
        strokeColor: '#94A3B8',
        fillColor: 'transparent',
        roughness: 1.2
      },
      // Left Formula Box
      {
        id: generateId(),
        type: 'shape',
        shapeType: 'rect',
        x: 60,
        y: 130,
        width: 290,
        height: 120,
        rotation: 1,
        opacity: 1,
        layerOrder: 3,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#8B5CF6', // Purple
        fillColor: '#F3E8FF',
        roughness: 1.1,
        label: 'Formula 01: Euler Formula\n\ne^(i*pi) + 1 = 0\n\n(Relates trig functions to complex exponentials)'
      },
      // Right Formula Box
      {
        id: generateId(),
        type: 'shape',
        shapeType: 'rect',
        x: 400,
        y: 130,
        width: 290,
        height: 120,
        rotation: -1,
        opacity: 1,
        layerOrder: 4,
        locked: false,
        strokeWidth: 2,
        strokeColor: '#059669', // Emerald
        fillColor: '#D1FAE5',
        roughness: 1.1,
        label: 'Formula 02: Quadratic Eq\n\nx = [-b ± sqrt(b^2 - 4ac)] / 2a\n\n(Finds roots of ax^2 + bx + c = 0)'
      }
    ]
  }
];
