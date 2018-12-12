import React from 'react';
import { Dispatch } from 'redux';
import { connect } from 'react-redux';

import { LocatePlugin } from '../../Core/CommonTypes';
import ViewController from '../../Core/Controllers/ViewController';
import { GlobalData } from '../../Core/State/StoreModules/GlobalData';
import { RootState } from '../../Core/State/Types';
import { Action } from '../../Utils/ActionCreatorUtils';
import { wrappable } from '../../Utils/ComponentUtils';
import { Seq } from '../../Utils/IterableUtils';

import AttributeAnalysisButton from './AttributeAnalysisButton';
import { State as AttributeAnalysis } from './AttributeAnalysisStoreModule';
import { ScopedAnalysisAction } from './BaseAttributeAnalysis/BaseAttributeAnalysisActions';
import { Question, RecordClass } from '../../Utils/WdkModel';

type StateProps = {
  globalData: GlobalData,
} & AttributeAnalysis;

type DispatchProps = {
  dispatch: Dispatch
};

type OwnProps = {
  locatePlugin: LocatePlugin;
  attributeName: string;
  questionName: string;
  recordClassName: string;
  reporterName: string;
  stepId: number;
};

type Props = {
  stateProps: StateProps;
  dispatchProps: DispatchProps;
} & OwnProps;


class AttributeAnalysisButtonController extends ViewController<Props> {

  plugin = this.props.locatePlugin<AttributeAnalysis['analyses'][string]>('attributeAnalysis');

  renderView() {
    const { questionName, recordClassName, reporterName, stepId } = this.props;
    const { globalData, analyses } = this.props.stateProps;

    const questionAttributes = Seq.from(globalData.questions as Question[])
      .filter(question => question.name === questionName)
      .flatMap(question => question.dynamicAttributes)

    const recordClassAttributes = Seq.from(globalData.recordClasses as RecordClass[])
      .filter(recordClass => recordClass.name === recordClassName)
      .flatMap(recordClass => recordClass.attributes);

    const reporter = questionAttributes.concat(recordClassAttributes)
      .flatMap(attribute => attribute.formats)
      .find(format => format.name === reporterName);

    const key = `${stepId}__${reporterName}`;
    const analysis = analyses && analyses[key];

    if (reporter == null) return null;

    const context = {
      type: 'attributeAnalysis',
      name: reporter.type,
      recordClassName: recordClassName
    }

    const dispatch = (action: Action): any => {
      this.props.dispatchProps.dispatch(
        ScopedAnalysisAction.create({ action, context, reporter, stepId })
      );
    }

    return (
      <AttributeAnalysisButton
        recordClassName={recordClassName}
        stepId={stepId}
        reporter={reporter}
        analysis={analysis}
        dispatch={dispatch}>
        {this.plugin.render(context, analysis, dispatch)}
      </AttributeAnalysisButton>
    );
  }

}

const mapStateToProps = (state: RootState): StateProps => ({
  analyses: state.attributeAnalysis.analyses,
  globalData: state.globalData
});

const mapDispatchToProps = (dispatch: Dispatch): DispatchProps => ({ dispatch });

const mergeProps = (stateProps: StateProps, dispatchProps: DispatchProps, ownProps: OwnProps): Props => ({
  stateProps,
  dispatchProps,
  ...ownProps
});

export default connect(
  mapStateToProps,
  mapDispatchToProps,
  mergeProps
)(wrappable(AttributeAnalysisButtonController));