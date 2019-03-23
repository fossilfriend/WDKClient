import React from 'react';
import { connect } from 'react-redux';
import {
  openMatchedTranscriptsFilter,
  closeMatchedTranscriptsFilter,
  requestMatchedTransFilterExpandedUpdate,
  requestMatchedTransFilterUpdate,
  setDisplayedSelection,
} from 'wdk-client/Actions/MatchedTranscriptsFilterActions';
import { RootState } from 'wdk-client/Core/State/Types';
import MatchedTranscriptsFilter from 'wdk-client/Views/MatchedTranscriptsFilter/MatchedTranscriptsFilter';
import {
  getFilterValue,
  FilterValue
} from 'wdk-client/StoreModules/MatchedTranscriptsFilterStoreModule';

const actionCreators = {
  openMatchedTranscriptsFilter,
  closeMatchedTranscriptsFilter,
  requestMatchedTransFilterExpandedUpdate,
  requestMatchedTransFilterUpdate,
  setDisplayedSelection
}
interface OwnProps {
  stepId: number;
  filterName: string;
}

type DispatchProps = typeof actionCreators;

type StateProps = Required<RootState['matchedTranscriptsFilter']> & {
  filterValue: FilterValue;
}


type Props = OwnProps & {
  stateProps?: Required<StateProps>;
  actionCreators: DispatchProps;
}

const Label: Record<string, string> = {
  Y: 'did meet the search criteria',
  N: 'did not meet the search criteria',
  YY: 'both searches',
  YN: 'just your previous search',
  NY: 'just your latest search',
  NN: 'neither search'
}

const Description: Record<string, string> = {
  matched_transcript_filter_array: 'Some Genes in your result have Transcripts that did not meet the search criteria.',
  gene_boolean_filter_array: ' Some Genes in your combined result have Transcripts that were not returned by one or both of the two input searches.'
}

const Leadin: Record<string, string> = {
  matched_transcript_filter_array: 'Include Transcripts that',
  gene_boolean_filter_array: 'Include Transcripts returned by'
}

class MatchedTranscriptsFilterController extends React.Component<Props> {

  componentDidMount() {
    const { stepId, filterName } = this.props;
    this.props.actionCreators.openMatchedTranscriptsFilter(stepId, filterName);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.stepId !== this.props.stepId) {
      const { stepId, filterName } = this.props;
      this.props.actionCreators.closeMatchedTranscriptsFilter(prevProps.stepId);
      this.props.actionCreators.openMatchedTranscriptsFilter(stepId, filterName);
    }
  }

  componentWillUnmount() {
    this.props.actionCreators.closeMatchedTranscriptsFilter(this.props.stepId);
  }

  render() {
    if (this.props.stateProps == null) return null;
    return <MatchedTranscriptsFilter
      {...this.props.stateProps}
      description={Description[this.props.filterName]}
      optionLeadin={Leadin[this.props.filterName]}
      optionLabel={Label}
      toggleExpansion={this.props.actionCreators.requestMatchedTransFilterExpandedUpdate}
      updateFilter={this.props.actionCreators.requestMatchedTransFilterUpdate}
      updateSelection={this.props.actionCreators.setDisplayedSelection}
    />;
  }

}

const statePropsIsComplete = hasAllProps<StateProps>(
  'stepId',
  'filterValue',
  'summary',
  'expanded'
);

export default connect<StateProps, DispatchProps, OwnProps, Props, RootState>(
  (state: RootState, ownProps: OwnProps) => {
    const step = state.steps.steps[ownProps.stepId];
    return {
      filterValue: getFilterValue(step, ownProps.filterName),
      ...state.matchedTranscriptsFilter
    } as StateProps;
  },
  actionCreators,
  (stateProps, actionCreators, ownProps) => ({
    ...ownProps,
    stateProps: statePropsIsComplete(stateProps) ? stateProps : undefined,
    actionCreators
  })
)(MatchedTranscriptsFilterController);

function hasAllProps<T>(...props: Array<keyof T>) {
  return (t: T) => props.every(prop => t[prop] != null)
}