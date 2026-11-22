import { useState } from 'react';
import { Filter, Plus, Trash2, BookmarkCheck } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { FilterGroup, FilterCondition } from '../../types';
import { generateId } from '../../lib/utils';

export interface FilterFieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'array';
  options?: { value: string; label: string }[];
}

interface FilterBuilderProps {
  fields: FilterFieldDef[];
  filterGroups: FilterGroup[];
  onChange: (groups: FilterGroup[]) => void;
  onSaveAsReport?: (reportName: string) => void;
  savedReports?: { id: string; name: string }[];
  activeReportId?: string | null;
  onSelectReport?: (reportId: string) => void;
}

export function FilterBuilder({
  fields,
  filterGroups,
  onChange,
  onSaveAsReport,
  savedReports = [],
  activeReportId,
  onSelectReport,
}: FilterBuilderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saveReportModal, setSaveReportModal] = useState(false);
  const [newReportTitle, setNewReportTitle] = useState('');

  const totalConditions = filterGroups.reduce((acc, g) => acc + g.conditions.length, 0);

  const getOperatorsForType = (type: string) => {
    switch (type) {
      case 'number':
        return [
          { value: 'equals', label: 'Equals (=)' },
          { value: 'greater_than', label: 'Greater Than (>)' },
          { value: 'less_than', label: 'Less Than (<)' },
          { value: 'between', label: 'Between' },
        ];
      case 'select':
        return [
          { value: 'is', label: 'Is' },
          { value: 'is_not', label: 'Is Not' },
        ];
      case 'array':
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'is_empty', label: 'Is Empty' },
          { value: 'not_empty', label: 'Not Empty' },
        ];
      case 'text':
      default:
        return [
          { value: 'contains', label: 'Contains' },
          { value: 'equals', label: 'Equals Exactly' },
          { value: 'starts_with', label: 'Starts With' },
          { value: 'is_empty', label: 'Is Empty' },
          { value: 'not_empty', label: 'Not Empty' },
        ];
    }
  };

  const addGroup = () => {
    const firstField = fields[0];
    const defaultOperator = getOperatorsForType(firstField.type)[0].value as FilterCondition['operator'];
    const newGroup: FilterGroup = {
      id: generateId('grp'),
      logic: 'AND',
      conditions: [
        {
          id: generateId('cond'),
          field: firstField.key,
          operator: defaultOperator,
          value: '',
        },
      ],
    };
    onChange([...filterGroups, newGroup]);
  };

  const removeGroup = (groupId: string) => {
    onChange(filterGroups.filter(g => g.id !== groupId));
  };

  const toggleGroupLogic = (groupId: string) => {
    onChange(
      filterGroups.map(g => (g.id === groupId ? { ...g, logic: g.logic === 'AND' ? 'OR' : 'AND' } : g))
    );
  };

  const addCondition = (groupId: string) => {
    const firstField = fields[0];
    const defaultOperator = getOperatorsForType(firstField.type)[0].value as FilterCondition['operator'];
    onChange(
      filterGroups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: [
            ...g.conditions,
            {
              id: generateId('cond'),
              field: firstField.key,
              operator: defaultOperator,
              value: '',
            },
          ],
        };
      })
    );
  };

  const removeCondition = (groupId: string, condId: string) => {
    onChange(
      filterGroups
        .map(g => {
          if (g.id !== groupId) return g;
          return {
            ...g,
            conditions: g.conditions.filter(c => c.id !== condId),
          };
        })
        .filter(g => g.conditions.length > 0)
    );
  };

  const updateCondition = (groupId: string, condId: string, updates: Partial<FilterCondition>) => {
    onChange(
      filterGroups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          conditions: g.conditions.map(c => {
            if (c.id !== condId) return c;
            const updated = { ...c, ...updates };
            // If field changed, update operator to appropriate default
            if (updates.field && updates.field !== c.field) {
              const fType = fields.find(f => f.key === updates.field)?.type || 'text';
              updated.operator = getOperatorsForType(fType)[0].value as FilterCondition['operator'];
              updated.value = '';
            }
            return updated;
          }),
        };
      })
    );
  };

  const clearAllFilters = () => {
    onChange([]);
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-1.5">
        <Button
          variant={totalConditions > 0 ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setIsOpen(!isOpen)}
          className="gap-1.5 text-xs font-normal"
        >
          <Filter className="h-3.5 w-3.5" />
          <span>Filters</span>
          {totalConditions > 0 && (
            <span className="ml-0.5 rounded-full bg-white/30 px-1.5 py-0.2 text-[10px] font-bold">
              {totalConditions}
            </span>
          )}
        </Button>

        {/* Saved reports quick selector if provided */}
        {savedReports.length > 0 && onSelectReport && (
          <select
            value={activeReportId || ''}
            onChange={e => onSelectReport(e.target.value)}
            className="h-8 text-xs rounded-md border border-slate-300 bg-white px-2 py-1 text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 max-w-[160px] truncate"
            title="Saved Custom Reports"
          >
            <option value="">Standard View</option>
            {savedReports.map(rep => (
              <option key={rep.id} value={rep.id}>
                {rep.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full mt-2 w-[480px] sm:w-[580px] rounded-xl border border-slate-200 bg-white p-4 shadow-2xl z-50 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
              <div>
                <h4 className="font-semibold text-slate-900 text-sm">Advanced Filter Builder</h4>
                <p className="text-[11px] text-slate-500">Filter records by combining AND / OR criteria</p>
              </div>
              <div className="flex items-center gap-2">
                {totalConditions > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-[11px] text-slate-500 hover:text-slate-700 underline"
                  >
                    Clear All
                  </button>
                )}
                {onSaveAsReport && totalConditions > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSaveReportModal(true)}
                    className="h-7 text-[11px] gap-1 text-blue-600 border-blue-200 bg-blue-50/50 hover:bg-blue-100"
                  >
                    <BookmarkCheck className="h-3 w-3" />
                    <span>Save Report</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Filter Groups List */}
            <div className="max-h-[360px] overflow-y-auto space-y-4 pr-1">
              {filterGroups.length === 0 && (
                <div className="py-6 text-center text-slate-400">
                  <Filter className="h-6 w-6 mx-auto mb-1.5 opacity-30" />
                  <p>No active criteria. Click &quot;Add Filter Condition&quot; below to filter.</p>
                </div>
              )}

              {filterGroups.map((group, gIdx) => (
                <div
                  key={group.id}
                  className="rounded-lg border border-slate-200 bg-slate-50/70 p-3 space-y-2.5"
                >
                  {/* Group header with AND/OR toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                        Condition Group {gIdx + 1}
                      </span>
                      <button
                        onClick={() => toggleGroupLogic(group.id)}
                        className="px-2 py-0.5 rounded text-[10px] font-bold bg-white border border-slate-300 text-blue-700 shadow-xs hover:bg-slate-100"
                        title="Click to toggle between Match ALL (AND) or Match ANY (OR)"
                      >
                        Match: {group.logic}
                      </button>
                    </div>

                    <button
                      onClick={() => removeGroup(group.id)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors"
                      title="Remove group"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Conditions inside this group */}
                  <div className="space-y-2">
                    {group.conditions.map(cond => {
                      const fieldDef = fields.find(f => f.key === cond.field) || fields[0];
                      const availableOps = getOperatorsForType(fieldDef?.type || 'text');

                      return (
                        <div key={cond.id} className="flex items-center gap-1.5">
                          {/* Field selector */}
                          <select
                            value={cond.field}
                            onChange={e => updateCondition(group.id, cond.id, { field: e.target.value })}
                            className="h-8 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800 font-medium w-36 shrink-0"
                          >
                            {fields.map(f => (
                              <option key={f.key} value={f.key}>
                                {f.label}
                              </option>
                            ))}
                          </select>

                          {/* Operator selector */}
                          <select
                            value={cond.operator}
                            onChange={e =>
                              updateCondition(group.id, cond.id, {
                                operator: e.target.value as FilterCondition['operator'],
                              })
                            }
                            className="h-8 rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 w-32 shrink-0"
                          >
                            {availableOps.map(op => (
                              <option key={op.value} value={op.value}>
                                {op.label}
                              </option>
                            ))}
                          </select>

                          {/* Value Input */}
                          {!['is_empty', 'not_empty', 'is_true', 'is_false'].includes(cond.operator) && (
                            <div className="flex-1 min-w-0 flex items-center gap-1">
                              {fieldDef.type === 'select' && fieldDef.options ? (
                                <select
                                  value={cond.value}
                                  onChange={e => updateCondition(group.id, cond.id, { value: e.target.value })}
                                  className="h-8 w-full rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
                                >
                                  <option value="">Select option...</option>
                                  {fieldDef.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <Input
                                  type={fieldDef.type === 'number' ? 'number' : 'text'}
                                  placeholder={fieldDef.type === 'number' ? 'Value...' : 'Search term...'}
                                  value={cond.value}
                                  onChange={e => updateCondition(group.id, cond.id, { value: e.target.value })}
                                  className="h-8 text-xs"
                                />
                              )}

                              {cond.operator === 'between' && (
                                <Input
                                  type="number"
                                  placeholder="To..."
                                  value={cond.secondValue || ''}
                                  onChange={e => updateCondition(group.id, cond.id, { secondValue: e.target.value })}
                                  className="h-8 text-xs w-20"
                                />
                              )}
                            </div>
                          )}

                          <button
                            onClick={() => removeCondition(group.id, cond.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => addCondition(group.id)}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-medium pt-1"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Add condition to this group</span>
                  </button>
                </div>
              ))}
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={addGroup}
                className="gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Criteria Group</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="text-xs px-4"
              >
                Apply Criteria
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Save as Report Modal */}
      {saveReportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs" onClick={() => setSaveReportModal(false)} />
          <div className="relative w-full max-w-sm rounded-xl border border-slate-200 bg-white p-5 shadow-2xl z-10">
            <h4 className="text-sm font-semibold text-slate-900">Save as Custom Report</h4>
            <p className="text-xs text-slate-500 mt-1">
              Give this filtered report view a name to easily reload it anytime.
            </p>
            <div className="mt-3">
              <Input
                autoFocus
                placeholder="e.g. Pune Experienced Trainers (>8 yrs)"
                value={newReportTitle}
                onChange={e => setNewReportTitle(e.target.value)}
                className="text-xs"
              />
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setSaveReportModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!newReportTitle.trim()}
                onClick={() => {
                  if (onSaveAsReport && newReportTitle.trim()) {
                    onSaveAsReport(newReportTitle.trim());
                    setSaveReportModal(false);
                    setNewReportTitle('');
                    setIsOpen(false);
                  }
                }}
              >
                Save Report
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
