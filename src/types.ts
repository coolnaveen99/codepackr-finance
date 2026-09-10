export type ToolCategory =
  | 'calculators'
  | 'loans'
  | 'investments'
  | 'tax'
  | 'salary'
  | 'retirement'
  | 'personal-finance'
  | 'business-finance';

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
