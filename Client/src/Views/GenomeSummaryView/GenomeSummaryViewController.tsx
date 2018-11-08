import * as React from 'react';
import { connect } from 'react-redux';

import PageController from 'wdk-client/Core/Controllers/PageController';
import { wrappable } from 'wdk-client/Utils/ComponentUtils';
import { Loading } from 'wdk-client/Components';
import LoadError from 'wdk-client/Components/PageStatus/LoadError';
import { RootState } from 'wdk-client/Core/State/Types';
import {createLoadingAction, createCompletedAction, createErrorAction} from 'wdk-client/Views/GenomeSummaryView/GenomeSummaryViewActions';
import {State} from 'wdk-client/StoreModules/GenomeSummaryViewStoreModule';

const actionCreators = {
  createLoadingAction,
  createCompletedAction,
  createErrorAction
};

type StateProps = State;
type DispatchProps = typeof actionCreators;

type Props = StateProps & DispatchProps;

class GenomeSummaryViewController extends PageController< Props > {

  isRenderDataLoaded() {
    return this.props.genomeSummaryData != null;
  }

  getTitle() {
    return "BLAST Results";
  }

  loadData () {
    if (this.props.genomeSummaryData == null) {
      this.props.createLoadingAction(this.props.match.params.stepId);
    }
  }

  isRenderDataLoadError() {
    return this.props.error != null;
  }

  renderDataLoadError() {
    return <LoadError/>;  // TODO: make this better
  }

  renderView() {
    if (this.props.genomeSummaryData == null) return <Loading/>;

    return (     <div>FIX ME</div>   
    );
  }
}

const mapStateToProps = (state: RootState) => state.blastSummaryView;

export default connect(
  mapStateToProps,
  actionCreators
) (wrappable(GenomeSummaryViewController));
