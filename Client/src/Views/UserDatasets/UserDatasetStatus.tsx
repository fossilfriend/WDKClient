import * as React from 'react';
import {
  IconAlt as Icon,
  Link,
  Tooltip,
} from 'wdk-client/Components';
import { UserDataset } from 'wdk-client/Utils/WdkModel';

type Props = {
  userDataset: UserDataset;
  projectId: string;
  displayName: string;
  linkToDataset: boolean;
  useTooltip: boolean;
}

const FOUR_HOURS = 4 * (1000 * 60 * 60);

export default function UserDatasetStatus(props: Props) {
  const { userDataset, projectId, displayName } = props;
  const { isInstalled, isCompatible, projects, age } = userDataset;
  const isInstallable = projects.includes(projectId);
  const isPending = isCompatible && age < FOUR_HOURS;
  const isError = isCompatible && !isPending;
  const appNames = projects.join(', ');
  const link = `/workspace/datasets/${userDataset.id}`;
  const content = (
    !isInstallable ? (
      <span>This data set is not compatible with {displayName}.</span>
    )
    : isInstalled ? (
      <span>This data set is installed and ready for use in {displayName}.</span>
    )
    : isPending ? (
      <span>This data set is currently being installed in {displayName}. Please check again soon.</span>
    )
    : isError ? (
      <span>This data set could not be installed in {displayName} due to a server error.</span>
    )
    : (
      <span>
        This dataset is not compatible with resources in this release of {displayName}.
        See <Link to={link + '#dataset-compatibility'}>Compatibility Information</Link> for more information.
      </span>
    )
  );
  const faIcon = !isInstallable ? 'minus-circle'
    : isInstalled ? 'check-circle'
    : isPending ? 'clock-o'
    : isError ? 'minus-circle'
    : 'exclamation-circle';
  const children = <Icon className="StatusIcon" fa={faIcon}/>;
  const visibleContent = props.useTooltip
    ? <Tooltip content={content}>{children}</Tooltip>
    : <React.Fragment>{children} {content}</React.Fragment>;
  return props.linkToDataset
    ? (
      <Link to={link}>
        {visibleContent}
      </Link>
    )
    : (
      visibleContent
    );
}
