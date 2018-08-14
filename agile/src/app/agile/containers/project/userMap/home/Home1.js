import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import _ from 'lodash';
import { Page, Header, Content, stores, axios } from 'choerodon-front-boot';
import { Table, Button, Select, Popover, Tabs, Tooltip, Input, Dropdown, Menu, Pagination, Spin, Icon, Card, Checkbox } from 'choerodon-ui';
import './Home.scss';
import CreateEpic from '../component/CreateEpic';
import Backlog from '../component/Backlog/Backlog.js';
import EpicCard from '../component/EpicCard/EpicCard.js';
import IssueCard from '../component/IssueCard/IssueCard.js';
import CreateIssue from '../component/CreateIssue/CreateIssue.js';

const Option = Select.Option;
const TabPane = Tabs.TabPane;
const { AppState } = stores;

@observer
class Home1 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      moreMenuShow: false,
    };
  }
  componentDidMount() {
    this.initData();
    // window.addEventListener('scroll', this.handleScroll, true);
    // window.onscroll = this.handleScroll;
  }
  componentWillUnmount() {
    this.setCurrentFilter([]);
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    const ele = document.getElementsByClassName('issue-content');
    if (ele.length > 0) {
      ele[0].style.height = `calc(100vh - ${parseInt(document.getElementsByClassName('issue-content')[0].offsetTop, 10) + 48}px)`;
    }
    return null;
  }
  initData =() => {
    this.props.UserMapStore.initData();
  };

  changeMode =(options) => {
    this.props.UserMapStore.setMode(options.key);
    const mode = options.key;
    if (mode === 'sprint') {
      this.props.UserMapStore.loadSprints();
    } else if (mode === 'version') {
      this.props.UserMapStore.loadVersions();
    }
    this.props.UserMapStore.loadIssues(options.key, 'usermap');
    this.props.UserMapStore.loadBacklogIssues();
  };
  handleCreateEpic = () => {
    this.props.UserMapStore.setCreateEpic(true);
  };

  addFilter =(filter) => {
    const { currentFilters } = this.props.UserMapStore;
    const arr = _.cloneDeep(currentFilters);
    const value = filter;
    const index = currentFilters.indexOf(value);
    if (index !== -1) {
      arr.splice(index, 1);
    } else {
      arr.push(value);
    }
    this.props.UserMapStore.setCurrentFilter(arr);
    this.props.UserMapStore.loadIssues('usermap');
  };

  changeMenuShow =(options) => {
    const { moreMenuShow } = this.state;
    this.setState({ moreMenuShow: !moreMenuShow });
  };

  filterIssue =(e) => {
    e.stopPropagation();
  };
  render() {
    const { UserMapStore } = this.props;
    const epicData = UserMapStore.getEpics;
    const { filters, mode, issues, createEpic, currentFilters, sprints, versions } = UserMapStore;
    const swimlanMenu = (
      <Menu onClick={this.changeMode} selectable>
        <Menu.Item key="none">无泳道</Menu.Item>
        <Menu.Item key="version">版本泳道</Menu.Item>
        <Menu.Item key="sprint">冲刺泳道</Menu.Item>
      </Menu>
    );
    return (
      <Page
        className="c7n-map"
        service={['agile-service.issue.deleteIssue', 'agile-service.issue.listIssueWithoutSub']}
      >
        <Header title="用户故事地图">
          <Dropdown overlay={swimlanMenu} trigger={['click']}>
            <Button>
              {mode === 'none' && '无泳道'}
              {mode === 'version' && '版本泳道'}
              {mode === 'sprint' && '冲刺泳道'}
              <Icon type="arrow_drop_down" />
            </Button>
          </Dropdown>
          <Button onClick={this.changeMenuShow}>
            更多 <Icon type="arrow_drop_down" />
          </Button>
          <div style={{ display: this.state.moreMenuShow ? 'block' : 'none', padding: '20px 14px' }} className="moreMenu">
            <div className="menu-title">史诗过滤器</div>
            <div style={{ height: 22, marginBottom: 10 }}>
              <Checkbox>已完成的史诗</Checkbox>
            </div>
            <div style={{ height: 22 }} >
              <Checkbox>应用快速搜索到史诗</Checkbox>
            </div>
            <div className="menu-title">导出</div>
            <div style={{ height: 22, marginBottom: 10 }}>导出为excel</div>
            <div style={{ height: 22, marginBottom: 10 }}>导出为图片</div>
          </div>
          <Button className="leftBtn" functyp="flat" onClick={this.handleCreateEpic}>
            <Icon type="playlist_add" />创建史诗
          </Button>
        </Header>
        <div style={{ float: 'left' }} className="map-content">
          <div style={{ height: 48, marginBottom: 10 }}>
            <div style={{ width: '100%', height: 48, background: 'white', position: 'relative', paddingTop: 10 }}>
              <div className="filter">
                <p>快速搜索:</p>
                <p
                  role="none"
                  style={{ background: `${currentFilters.includes('mine') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('mine') ? 'white' : '#3F51B5'}` }}
                  onClick={this.addFilter.bind(this, 'mine')}
                >
                  仅我的问题
                </p>
                <p 
                  role="none" 
                  style={{ background: `${currentFilters.includes('userStory') ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes('userStory') ? 'white' : '#3F51B5'}` }} 
                  onClick={this.addFilter.bind(this, 'userStory')}
                >
                  仅用户故事
                </p>
                {
                  filters.map(filter =>
                    (<p
                      role="none" 
                      style={{ background: `${currentFilters.includes(filter.filterId) ? 'rgb(63, 81, 181)' : 'white'}`, color: `${currentFilters.includes(filter.filterId) ? 'white' : '#3F51B5'}` }}
                      onClick={this.addFilter.bind(this, filter.filterId)}
                      key={filter.filterId}
                    >
                      {filter.name}
                    </p>),
                  ) }
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', height: 98 }} >
            {epicData.map(epic => (
              <EpicCard
                epic={epic}
              />
            ))}
          </div>
          <div className="swimlane-container" style={{ overflowY: 'scroll', height: `calc(100vh - ${document.getElementById('autoRouter').offsetTop + 48 + 48 + 10 + 98 + 58}px)`, minWidth: `${epicData.length * 220 + epicData.length * 10 - 10}px` }}>
            {mode === 'none' && (<React.Fragment>
              <div style={{ width: '100%', height: 42, position: 'relative' }}>
                <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                  <span style={{ position: 'fixed', left: 274 }}>issue</span>
                  <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                    <p className="point-span" style={{ background: '#4D90FE' }}>
                      {_.reduce(issues, (sum, issue) => {
                        if (issue.statusCode === 'todo') {
                          return sum + issue.storyPoints;
                        } else {
                          return sum;
                        }
                      }, 0)}
                    </p>
                    <p className="point-span" style={{ background: '#FFB100' }}>
                      {_.reduce(issues, (sum, issue) => {
                        if (issue.statusCode === 'doing') {
                          return sum + issue.storyPoints;
                        } else {
                          return sum;
                        }
                      }, 0)}
                    </p>
                    <p className="point-span" style={{ background: '#00BFA5' }}>
                      {_.reduce(issues, (sum, issue) => {
                        if (issue.statusCode === 'done') {
                          return sum + issue.storyPoints;
                        } else {
                          return sum;
                        }
                      }, 0)}
                    </p>
                    <p>
                      <Icon type="baseline-arrow_drop_down" />
                    </p>

                  </div>
                </div>
              </div>
              <div style={{ display: 'flex' }}>
                {epicData.map((epic, index) => (<div className="swimlane-column">
                  <React.Fragment>
                    {_.filter(issues, issue => issue.epicId === epic.issueId).map(item => (
                      <IssueCard
                        issue={item}
                      />
                    ))}
                  </React.Fragment>
                </div>))}
              </div>
            </React.Fragment>
            )}
            {mode === 'sprint' && issues.length &&
              <React.Fragment>
                {sprints.map(sprint => (<React.Fragment key={'sprint'}>
                  <div style={{ width: '100%', height: 42, position: 'relative' }}>
                    <div style={{ position: 'relative', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                      <span style={{ position: 'fixed', left: 274 }}>{sprint.sprintName}</span>
                      <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                        <p className="point-span" style={{ background: '#4D90FE' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                            if (issue.statusCode === 'todo') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#FFB100' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                            if (issue.statusCode === 'doing') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#00BFA5' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId === sprint.sprintId), (sum, issue) => {
                            if (issue.statusCode === 'done') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p>
                          <Icon type="baseline-arrow_drop_down" />
                        </p>

                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {epicData.map((epic, index) => (<div className="swimlane-column">
                      <React.Fragment>
                        {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId === sprint.sprintId).map(item => (
                          <div className="issue-card">{item.epicId}</div>
                        ))}
                      </React.Fragment>
                    </div>))}
                  </div>
                </React.Fragment>))}
                <React.Fragment key={'no-sprint'}>
                  <div style={{ width: '100%', height: 42, position: 'relative' }}>
                    <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                      <span style={{ position: 'fixed', left: 274 }}>未计划的</span>
                      <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                        <p className="point-span" style={{ background: '#4D90FE' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                            if (issue.statusCode === 'todo') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#FFB100' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                            if (issue.statusCode === 'doing') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p className="point-span" style={{ background: '#00BFA5' }}>
                          {_.reduce(_.filter(issues, issue => issue.sprintId == null), (sum, issue) => {
                            if (issue.statusCode === 'done') {
                              return sum + issue.storyPoints;
                            } else {
                              return sum;
                            }
                          }, 0)}
                        </p>
                        <p>
                          <Icon type="baseline-arrow_drop_down" />
                        </p>

                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex' }}>
                    {epicData.map((epic, index) => (<div className="swimlane-column">
                      <React.Fragment>
                        {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId == null).map(item => (
                          <div className="issue-card">{item.epicId}</div>
                        ))}
                      </React.Fragment>
                    </div>))}
                  </div>
                </React.Fragment>
              </React.Fragment>
            }
            {mode === 'version' && issues.length && <React.Fragment>
              {versions.map(version => (<React.Fragment>
                <div style={{ width: '100%', height: 42, position: 'relative' }}>
                  <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                    <span style={{ position: 'fixed', left: 274 }}>{version.name}</span>
                    <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                      <p className="point-span" style={{ background: '#4D90FE' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                          if (issue.statusCode === 'todo') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p className="point-span" style={{ background: '#FFB100' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                          if (issue.statusCode === 'doing') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p className="point-span" style={{ background: '#00BFA5' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId === version.versionId), (sum, issue) => {
                          if (issue.statusCode === 'done') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p>
                        <Icon type="baseline-arrow_drop_down" />
                      </p>

                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {epicData.map((epic, index) => (<div className="swimlane-column">
                    <React.Fragment>
                      {_.filter(issues, issue => issue.epicId === epic.issueId && issue.sprintId === version.versionId).map(item => (
                        <div className="issue-card">{item.epicId}</div>
                      ))}
                    </React.Fragment>
                  </div>))}
                </div>
              </React.Fragment>))}
              <React.Fragment key={'no-sprint'}>
                <div style={{ width: '100%', height: 42, position: 'relative' }}>
                  <div style={{ position: 'fixed', background: 'rgba(0,0,0,0.02)', height: 42, width: '100%', borderBottom: '1px solid rgba(0,0,0,0.12)', borderTop: '1px solid rgba(0,0,0,0.12)' }}>
                    <span style={{ position: 'fixed', left: 274 }}>未计划的</span>
                    <div style={{ position: 'fixed', right: 10, display: 'flex', marginTop: 10 }}>
                      <p className="point-span" style={{ background: '#4D90FE' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                          if (issue.statusCode === 'todo') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p className="point-span" style={{ background: '#FFB100' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                          if (issue.statusCode === 'doing') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p className="point-span" style={{ background: '#00BFA5' }}>
                        {_.reduce(_.filter(issues, issue => issue.versionId == null), (sum, issue) => {
                          if (issue.statusCode === 'done') {
                            return sum + issue.storyPoints;
                          } else {
                            return sum;
                          }
                        }, 0)}
                      </p>
                      <p>
                        <Icon type="baseline-arrow_drop_down" />
                      </p>

                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex' }}>
                  {epicData.map((epic, index) => (<div className="swimlane-column">
                    <React.Fragment>
                      {_.filter(issues, issue => issue.epicId === epic.issueId && issue.versionId == null).map(item => (
                        <div className="issue-card">{item.epicId}</div>
                      ))}
                    </React.Fragment>
                  </div>))}
                </div>
              </React.Fragment>
            </React.Fragment>
            }
          </div>
        </div>
        <CreateEpic visible={createEpic} />
        <Backlog />
      </Page>
    );
  }
}
export default Home1;
