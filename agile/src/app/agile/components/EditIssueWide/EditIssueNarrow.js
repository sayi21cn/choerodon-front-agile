/* eslint-disable react/sort-comp */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { stores, axios } from 'choerodon-front-boot';
import { withRouter } from 'react-router-dom';
import { Spin } from 'choerodon-ui';
import './EditIssueNarrow.scss';
import {
  loadBranchs, loadDatalogs, loadLinkIssues,
  loadIssue, loadWorklogs, loadWikies, getFieldAndValue,
} from '../../api/NewIssueApi';
import CopyIssue from '../CopyIssue';
import TransformSubIssue from '../TransformSubIssue';
import TransformFromSubIssue from '../TransformFromSubIssue';
import Assignee from '../Assignee';
import ChangeParent from '../ChangeParent';
import IssueSidebar from '../EditIssueNarrow/IssueComponent/IssueSidebar';
import IssueHeader from '../EditIssueNarrow/IssueComponent/IssueHeader';
import IssueBody from '../EditIssueNarrow/IssueComponent/IssueBody/IssueBody';
import VisibleStore from '../../stores/common/visible/VisibleStore';

const { AppState } = stores;

let loginUserId;
let hasPermission;
@observer class CreateSprint extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issueLoading: false,
    };
  }

  componentDidMount() {
    const { onRef, issueId } = this.props;
    if (onRef) {
      onRef(this);
    }
    this.loadIssueDetail(issueId);

    axios.all([
      axios.get('/iam/v1/users/self'),
      axios.post('/iam/v1/permissions/checkPermission', [{
        code: 'agile-service.project-info.updateProjectInfo',
        organizationId: AppState.currentMenuType.organizationId,
        projectId: AppState.currentMenuType.id,
        resourceType: 'project',
      }]),
    ])
      .then(axios.spread((users, permission) => {
        loginUserId = users.id;
        hasPermission = permission[0].approve;
      }));
  }

  componentWillReceiveProps(nextProps) {
    const { issueId } = this.props;
    if (nextProps.issueId && nextProps.issueId !== issueId) {
      this.loadIssueDetail(nextProps.issueId);
    }
  }

  loadIssueDetail = (paramIssueId) => {
    const { store, issueId } = this.props;
    const id = paramIssueId || issueId;
    this.setState({
      issueLoading: true,
    }, () => {
      loadIssue(id).then((res) => {
        const param = {
          schemeCode: 'agile_issue',
          context: res.typeCode,
          pageCode: 'agile_issue_edit',
        };
        getFieldAndValue(id, param).then((fields) => {
          this.setState({
            issueLoading: false,
          });
          store.setIssueFields(res, fields);
        });
      });
      axios.all([
        loadWikies(id),
        loadWorklogs(id),
        loadDatalogs(id),
        loadLinkIssues(id),
        loadBranchs(id),
      ])
        .then(axios.spread((wiki, workLogs, dataLogs, linkIssues, branches) => {
          store.initIssueAttribute(wiki, workLogs, dataLogs, linkIssues, branches);
        }));
    });
  };

  handleCopyIssue = () => {
    const { onUpdate, reloadIssue } = this.props;
    VisibleStore.setCopyIssueShow(false);
    if (onUpdate) {
      onUpdate();
    }
    if (reloadIssue) {
      reloadIssue();
    }
  };

  handleTransformSubIssue() {
    const { onUpdate, reloadIssue } = this.props;
    VisibleStore.setTransformSubIssueShow(false);
    if (onUpdate) {
      onUpdate();
    }
    if (reloadIssue) {
      reloadIssue();
    }
  }

  handleTransformFromSubIssue() {
    const { onUpdate, reloadIssue } = this.props;
    VisibleStore.setTransformFromSubIssueShow(false);
    if (onUpdate) {
      onUpdate();
    }
    if (reloadIssue) {
      reloadIssue();
    }
  }

  render() {
    const {
      store,
      backUrl,
      onCancel,
      style,
      onUpdate,
      reloadIssue,
    } = this.props;
    const {
      issueLoading,
    } = this.state;
    const issue = store.getIssue;
    const {
      issueId, issueNum, summary,
      assigneeId, objectVersionNumber,
    } = issue;
    const linkIssues = store.getLinkIssues;

    const {
      getChangeParentShow: changeParentShow,
      getAssigneeShow: assigneeShow,
      getCopyIssueShow: copyIssueShow,
      getTransformSubIssueShow: transformSubIssueShow,
      getTransformFromSubIssueShow: transformFromSubIssueShow,
    } = VisibleStore;

    return (
      <div className="choerodon-modal-editIssue" style={style}>
        {
          issueLoading ? (
            <div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(255, 255, 255, 0.65)',
                zIndex: 9999,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Spin />
            </div>
          ) : null
        }
        <IssueSidebar
          store={store}
          reloadIssue={this.loadIssueDetail}
          onUpdate={onUpdate}
        />
        <div className="c7n-content">
          <IssueHeader
            store={store}
            reloadIssue={this.loadIssueDetail}
            backUrl={backUrl}
            onCancel={onCancel}
            loginUserId={loginUserId}
            hasPermission={hasPermission}
            onUpdate={onUpdate}
          />
          <IssueBody
            store={store}
            reloadIssue={this.loadIssueDetail}
            onUpdate={onUpdate}
            loginUserId={loginUserId}
            hasPermission={hasPermission}
          />
        </div>
        {
          copyIssueShow ? (
            <CopyIssue
              issueId={issueId}
              issueNum={issueNum}
              issue={issue}
              issueLink={linkIssues}
              issueSummary={summary}
              visible={copyIssueShow}
              onCancel={() => VisibleStore.setCopyIssueShow(false)}
              onOk={this.handleCopyIssue.bind(this)}
            />
          ) : null
        }
        {
          transformSubIssueShow ? (
            <TransformSubIssue
              visible={transformSubIssueShow}
              issueId={issueId}
              issueNum={issueNum}
              ovn={objectVersionNumber}
              onCancel={() => VisibleStore.setTransformSubIssueShow(false)}
              onOk={this.handleTransformSubIssue.bind(this)}
              store={store}
            />
          ) : null
        }
        {
          transformFromSubIssueShow ? (
            <TransformFromSubIssue
              visible={transformFromSubIssueShow}
              issueId={issueId}
              issueNum={issueNum}
              ovn={objectVersionNumber}
              onCancel={() => VisibleStore.setTransformFromSubIssueShow(false)}
              onOk={this.handleTransformFromSubIssue.bind(this)}
              store={store}
            />
          ) : null
        }

        {
          assigneeShow ? (
            <Assignee
              issueId={issueId}
              issueNum={issueNum}
              visible={assigneeShow}
              assigneeId={assigneeId}
              objectVersionNumber={objectVersionNumber}
              onOk={() => {
                VisibleStore.setAssigneeShow(false);
                if (reloadIssue) {
                  reloadIssue();
                }
              }}
              onCancel={() => {
                VisibleStore.setAssigneeShow(false);
              }}
            />
          ) : null
        }
        {
          changeParentShow ? (
            <ChangeParent
              issueId={issueId}
              issueNum={issueNum}
              visible={changeParentShow}
              objectVersionNumber={objectVersionNumber}
              onOk={() => {
                VisibleStore.setChangeParentShow(false);
                if (reloadIssue) {
                  reloadIssue();
                }
              }}
              onCancel={() => {
                VisibleStore.setChangeParentShow(false);
              }}
            />
          ) : null
        }
      </div>
    );
  }
}
export default withRouter(CreateSprint);
