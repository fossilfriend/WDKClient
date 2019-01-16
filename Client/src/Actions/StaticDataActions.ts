import { ActionThunk } from 'wdk-client/Core/WdkMiddleware';
import { CategoryOntology } from 'wdk-client/Utils/CategoryUtils';
import { Question, RecordClass } from 'wdk-client/Utils/WdkModel';
import { ServiceConfig } from 'wdk-client/Utils/WdkService';
import { User, UserPreferences } from 'wdk-client/Utils/WdkUser';
import { makeActionCreator, InferAction } from 'wdk-client/Utils/ActionCreatorUtils';

export const configLoaded = makeActionCreator(
  'static/config-loaded',
  (config: ServiceConfig) => ({ config })
);

export const ontologyLoaded = makeActionCreator(
  'static/ontology-loaded',
  (ontology: CategoryOntology) => ({ ontology })
)

export const questionsLoaded = makeActionCreator(
  'static/questions-loaded',
  (questions: Question[]) => ({ questions })
);

export const recordClassesLoaded = makeActionCreator(
  'static/recordClasses-loaded',
  (recordClasses: RecordClass[]) => ({ recordClasses })
);

export const userLoaded = makeActionCreator(
  'static/user-loaded',
  (user: User) => ({ user })
);

export const preferencesLoaded = makeActionCreator(
  'static/preferences-loaded',
  (preferences: UserPreferences) => ({ preferences })
);

export const allDataLoaded = makeActionCreator(
  'static/all-data-loaded'
);

export const loadError = makeActionCreator(
  'static/load-error',
  (error: Error) => ({ error })
);


export type Action =
  | InferAction<typeof configLoaded>
  | InferAction<typeof ontologyLoaded>
  | InferAction<typeof questionsLoaded>
  | InferAction<typeof recordClassesLoaded>
  | InferAction<typeof userLoaded>
  | InferAction<typeof preferencesLoaded>
  | InferAction<typeof allDataLoaded>
  | InferAction<typeof loadError>


export function loadAllStaticData(): ActionThunk<Action> {
  return async function run({ wdkService }) {
    return Promise.all([
      wdkService.getConfig().then(configLoaded),
      wdkService.getOntology().then(ontologyLoaded),
      wdkService.getQuestions().then(questionsLoaded),
      wdkService.getRecordClasses().then(recordClassesLoaded),
      wdkService.getCurrentUser().then(userLoaded),
      wdkService.getCurrentUserPreferences().then(preferencesLoaded),
      allDataLoaded()
    ])
    .catch(loadError);
  }
}