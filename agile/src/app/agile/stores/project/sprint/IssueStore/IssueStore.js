import {
  observable, action, computed, toJS,
} from 'mobx';
import { store, stores, axios } from 'choerodon-front-boot';
import { loadIssues } from '../../../../api/NewIssueApi';

const { AppState } = stores;
const proId = AppState.currentMenuType.id;
const orgId = AppState.currentMenuType.organizationId;

const filter = {
  advancedSearchArgs: {
    statusId: [],
    priorityId: [],
    issueTypeId: [],
  },
  content: '',
  quickFilterIds: [],
  searchArgs: {
    assignee: '',
    component: '',
    epic: '',
    issueNum: '',
    sprint: '',
    summary: '',
    version: '',
    updateStartDate: null,
    updateEndDate: null,
    createStartDate: null,
    createEndDate: null,
  },
};


@store('SprintCommonStore')
class SprintCommonStore {
  @observable issues = [];

  @observable pagination = {};

  @observable filteredInfo = {};

  @observable order = {
    orderField: '',
    orderType: '',
  };

  @observable loading = true;

  @observable paramType = undefined;

  @observable paramId = undefined;

  @observable paramName = undefined;

  @observable paramStatus = undefined;

  @observable paramPriority = undefined;

  @observable paramIssueType = undefined;

  @observable paramIssueId = undefined;

  @observable paramOpenIssueId = undefined;

  @observable paramUrl = undefined;

  @observable barFilters = undefined;

  @observable quickSearch = [];

  @observable issueTypes = [];

  @observable priorities = [];

  @observable defaultPriorityId = false;

  @observable issuePriority = [];

  @observable issueStatus = [];

  init() {
    this.setOrder({
      orderField: '',
      orderType: '',
    });
    this.setFilter({
      advancedSearchArgs: {},
      searchArgs: {},
    });
    // this.setFilteredInfo({});
    // this.loadIssues();
  }

  @action setIssues(data) {
    this.issues = data;
  }

  @computed get getIssues() {
    return toJS(this.issues);
  }

  @action setQuickSearch(data) {
    this.quickSearch = data;
  }

  @computed get getQuickSearch() {
    return toJS(this.quickSearch);
  }

  @action setIssueTypes(data) {
    this.issueTypes = data;
  }

  @computed get getIssueTypes() {
    return this.issueTypes.slice();
  }

  @action setIssueStatus(data) {
    this.issueStatus = data;
  }

  @computed get getIssueStatus() {
    return toJS(this.issueStatus);
  }

  @action setIssuePriority(data) {
    this.issuePriority = data;
  }

  @computed get getIssuePriority() {
    return toJS(this.issuePriority);
  }

  @action setSelectedQuickSearch(data) {
    if (data) {
      Object.assign(filter, data);
    }
  }

  @action setPagination(data) {
    this.pagination = data;
  }

  @action setFilter(data) {
    this.filter = data;
  }

  @action setAdvArg(data) {
    if (data) {
      Object.assign(filter.advancedSearchArgs, data);
    }
  }

  @action setArg(data) {
    if (data) {
      Object.assign(filter.searchArgs, data);
    }
  }

  @action setOrder(orderField, orderType) {
    this.order.orderField = orderField;
    this.order.orderType = orderType;
  }

  @action setLoading(data) {
    this.loading = data;
  }

  @action setParamType(data) {
    this.paramType = data;
  }

  @action setParamId(data) {
    this.paramId = data;
  }

  @action setParamName(data) {
    this.paramName = data;
  }

  @computed get getParamName() {
    return toJS(this.paramName);
  }

  @action setParamStatus(data) {
    this.paramStatus = data;
  }

  @action setParamPriority(data) {
    this.paramPriority = data;
  }

  @action setParamIssueType(data) {
    this.paramIssueType = data;
  }

  @action setParamIssueId(data) {
    this.paramIssueId = data;
  }

  @action setParamOpenIssueId(data) {
    this.paramOpenIssueId = data;
  }

  @action setParamUrl(data) {
    this.paramUrl = data;
  }

  @action setBarFilters(data) {
    if (!this.paramName) {
      let res = '';
      data.forEach((item) => {
        res += item;
      });
      Object.assign(filter, { content: res });
    }
  }

  loadIssues(page = 0, size = 10) {
    this.setLoading(true);
    const { orderField = '', orderType = '' } = this.order;
    return loadIssues(page, size, toJS(this.getFilter), orderField, orderType)
      .then((res) => {
        this.setIssues(res.content);
        this.setPagination({
          current: res.number + 1,
          pageSize: res.size,
          total: res.totalElements,
        });
        this.setLoading(false);
        return Promise.resolve(res);
      });
  }

  async loadCurrentSetting() {
    const quickSearch = await this.loadQuickSearch();
    this.setQuickSearch(quickSearch);

    const type = await this.loadType();
    this.setIssueTypes(type);

    const status = await this.loadStatus();
    this.setIssueStatus(status);

    const priorities = await this.loadPriorities();
    this.setIssuePriority(priorities);
  }

  loadQuickSearch = () => axios.get(`/agile/v1/projects/${proId}/quick_filter`);

  loadType = () => axios.get(`/issue/v1/projects/${proId}/schemes/query_issue_types?scheme_type=agile`);

  loadStatus = () => axios.get(`/issue/v1/projects/${proId}/schemes/query_status_by_project_id?scheme_type=agile`);

  loadPriorities = () => axios.get(`/issue/v1/organizations/${orgId}/priority/list_by_org`);

  createIssue(issueObj, projectId = AppState.currentMenuType.id) {
    const issue = {
      projectId: proId,
      ...issueObj,
    };
    return axios.post(`/agile/v1/projects/${projectId}/issue`, issue);
  }

  @computed get getBackUrl() {
    const urlParams = AppState.currentMenuType;
    if (!this.paramUrl) {
      return undefined;
    } else if (this.paramUrl === 'backlog') {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}&paramIssueId=${this.paramIssueId}&paramOpenIssueId=${this.paramOpenIssueId}`;
    } else {
      return `/agile/${this.paramUrl}?type=${urlParams.type}&id=${urlParams.id}&name=${urlParams.name}&organizationId=${urlParams.organizationId}`;
    }
  }

  @computed get getFilter() {
    const otherArgs = {
      type: this.paramType,
      id: this.paramId ? [this.paramId] : undefined,
      issueIds: this.paramIssueId ? [this.paramIssueId] : undefined,
    };
    return {
      ...filter,
      // otherArgs: this.barFilters ? otherArgs : {},
      otherArgs,
    };
  }

  @computed get getPriorities() {
    return this.priorities.slice();
  }

  @action setPriorities(data) {
    this.priorities = data;
  }

  @computed get getDefaultPriorityId() {
    return this.defaultPriorityId;
  }

  @action setDefaultPriorityId(data) {
    this.defaultPriorityId = data;
  }
}
const sprintCommonStore = new SprintCommonStore();
export default sprintCommonStore;
