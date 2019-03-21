import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import classnames from 'classnames';
import SprintHeader from './SprintHeader';
import SprintBody from './SprintBody';
import NoneSprint from './NoneSprint';
import NoneBacklog from './NoneBacklog';
import BacklogHeader from './BacklogHeader';
import BacklogStore from '../../../../../../stores/project/backlog/BacklogStore';

const shouldContainTypeCode = ['issue_epic', 'sub_task', 'feature'];

@inject('AppState')
@observer class SprintContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      expand: true,
    };
    this.strategyMap = new Map([
      ['sprint', this.renderSprint],
      ['backlog', this.renderBacklog],
    ]);
  }

  toggleSprint = () => {
    const { expand } = this.state;
    this.setState({
      expand: !expand,
    });
  };

  renderBacklog = (backlogData) => {
    const { expand } = this.state;
    const issueCount = BacklogStore.getIssueMap.get('0') ? BacklogStore.getIssueMap.get('0').length : 0;
    return (
      <React.Fragment>
        <BacklogHeader
          issueCount={issueCount}
          data={backlogData}
          expand={expand}
          sprintId="0"
          toggleSprint={this.toggleSprint}
        />
        <SprintBody
          issueType={BacklogStore.getIssueTypes.filter(type => shouldContainTypeCode.indexOf(type.typeCode) === -1)}
          defaultType={BacklogStore.getIssueTypes.find(type => type.typeCode === 'story')}
          defaultPriority={BacklogStore.getDefaultPriority}
          issueCount={!!issueCount}
          expand={expand}
          sprintId="0"
          droppableId="backlogData"
          EmptyIssueComponent={NoneBacklog}
        />
      </React.Fragment>
    );
  };

  renderSprint = (sprintItem) => {
    const { refresh } = this.props;
    const { expand } = this.state;
    const issueCount = BacklogStore.getIssueMap.get(sprintItem.sprintId.toString()) ? BacklogStore.getIssueMap.get(sprintItem.sprintId.toString()).length : 0;
    return (
      <React.Fragment
        key={sprintItem.sprintId}
      >
        <SprintHeader
          refresh={refresh}
          issueCount={issueCount}
          data={sprintItem}
          expand={expand}
          sprintId={sprintItem.sprintId.toString()}
          toggleSprint={this.toggleSprint}
        />
        <SprintBody
          issueType={BacklogStore.getIssueTypes.filter(type => shouldContainTypeCode.indexOf(type.typeCode) === -1)}
          defaultType={BacklogStore.getIssueTypes.find(type => type.typeCode === 'story')}
          defaultPriority={BacklogStore.getDefaultPriority}
          issueCount={!!issueCount}
          expand={expand}
          sprintId={sprintItem.sprintId.toString()}
          droppableId={sprintItem.sprintId.toString()}
          EmptyIssueComponent={NoneSprint}
        />
      </React.Fragment>
    );
  };

  render() {
    const { data, type } = this.props;
    return this.strategyMap.get(type)(data);
  }
}

export default SprintContainer;