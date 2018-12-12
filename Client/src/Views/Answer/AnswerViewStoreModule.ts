import { Answer, AttributeField, Question, RecordClass, RecordInstance } from '../../Utils/WdkModel';
import { ServiceError } from '../../Utils/WdkService';
import {
  AddedAction,
  AnswerOptions,
  AttributesChangedAction,
  ColumnMovedAction,
  ErrorAction,
  LoadingAction,
  TableFilteredAction,
  TableSortedAction,
} from './AnswerViewActionCreators';
import { filterRecords } from '../Records/RecordUtils';

export const key = 'answerView';

type Action = LoadingAction
            | AddedAction
            | ErrorAction
            | TableSortedAction
            | AttributesChangedAction
            | ColumnMovedAction
            | TableFilteredAction;

export type FilterState = {
  filterTerm: string;
  filterAttributes: string[];
  filterTables: string[];
};

export type State = Partial<Answer & AnswerOptions & FilterState & {
  question: Question;
  recordClass: RecordClass;
  allAttributes: AttributeField[];
  visibleAttributes: AttributeField[];
  unfilteredRecords: RecordInstance[];
  isLoading: boolean;
  error?: Error | ServiceError;
}>;

const initialState = {};

export function reduce(state: State = initialState, action: Action) {
  switch(action.type) {
    case 'answer/loading': return { ...state, isLoading: true, error: undefined };
    case 'answer/error': return { ...action.payload };
    case 'answer/added': return addAnswer(state, action.payload);
    case 'answer/attributes-changed': return updateVisibleAttributes(state, action.payload);
    case 'answer/sorting-updated': return updateSorting(state, action.payload);
    case 'answer/column-moved': return moveTableColumn(state, action.payload);
    case 'answer/filtered': return updateFilter(state, action.payload);
    default: return state;
  }
}

function addAnswer( state: State, payload: AddedAction["payload"] ) {
  let { answer, displayInfo, question, recordClass, parameters } = payload;

  // in case we used a magic string to get attributes, reset fetched attributes in displayInfo
  displayInfo.attributes = answer.meta.attributes;

  // need to filter wdk_weight from multiple places;
  let isNotWeight = (attr: string | AttributeField) =>
    typeof attr === 'string' ? attr != 'wdk_weight' : attr.name != 'wdk_weight';

  // collect attributes from recordClass and question
  let allAttributes = recordClass.attributes.concat(question.dynamicAttributes).filter(isNotWeight);

  // use previously selected visible attributes unless they don't exist
  let visibleAttributes = state.visibleAttributes;
  if (!visibleAttributes || state.meta && state.meta.recordClassName !== answer.meta.recordClassName) {
    // need to populate attribute details for visible attributes
    visibleAttributes = allAttributes
      .filter(attr => isNotWeight(attr) && question.defaultAttributes.includes(attr.name));
  }

  // Remove search weight from answer meta since it doens't apply to non-Step answers
  answer.meta.attributes = answer.meta.attributes.filter(isNotWeight);

  /*
   * This will update the keys `filteredRecords`, and `answerSpec` in `state`.
   */
  return Object.assign({}, state, {
    meta: answer.meta,
    question,
    recordClass,
    parameters,
    allAttributes,
    visibleAttributes,
    unfilteredRecords: answer.records,
    records: filterRecords(answer.records, { 
      filterTerm: state.filterTerm || '', 
      filterAttributes: state.filterAttributes || [], 
      filterTables:state.filterTables || [] 
    }),
    isLoading: false,
    displayInfo
  });
}

/**
 * Update the position of an attribute in the answer table.
 *
 * @param {string} columnName The name of the attribute being moved.
 * @param {number} newPosition The 0-based index to move the attribute to.
 */
function moveTableColumn(state: State, { columnName, newPosition }: ColumnMovedAction["payload"]) {
  /* make a copy of list of attributes we will be altering */
  let attributes = [ ...(state.visibleAttributes || []) ];

  /* The current position of the attribute being moved */
  let currentPosition = attributes.findIndex(function(attribute) {
    return attribute.name === columnName;
  });

  /* The attribute being moved */
  let attribute = attributes[currentPosition];

  // remove attribute from array
  attributes.splice(currentPosition, 1);

  // then, insert into new position
  attributes.splice(newPosition, 0, attribute);

  return Object.assign({}, state, { visibleAttributes: attributes });
}

function updateVisibleAttributes(state: State, { attributes }: AttributesChangedAction["payload"]) {
  // Create a new copy of visibleAttributes
  let visibleAttributes = attributes.slice(0);

  // Create a new copy of state
  return Object.assign({}, state, { visibleAttributes });
}

function updateSorting(state: State, { sorting }: TableSortedAction["payload"]) {
  return Object.assign({}, state, {
    displayInfo: Object.assign({}, state.displayInfo, { sorting })
  });
}

function updateFilter(state: State, payload: TableFilteredAction["payload"]) {
  let filterSpec = {
    filterTerm: payload.terms,
    filterAttributes: payload.attributes || [],
    filterTables: payload.tables || []
  };
  return Object.assign({}, state, filterSpec, {
    records: filterRecords(state.unfilteredRecords || [], filterSpec)
  });
}