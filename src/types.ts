export type ToolCategory = 'calculators';

export type CategoryFilter = ToolCategory | 'all' | 'bookmarks';

export interface ToolDef {
  id: string;
  name: string;
  category: ToolCategory;
  description: string;
  keywords: string[];
  icon: string;
  popular?: boolean;
  isNew?: boolean;
  tags?: string[];
}
