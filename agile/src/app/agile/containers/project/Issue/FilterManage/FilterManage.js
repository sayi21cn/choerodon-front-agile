import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Form, Input, Icon, Tooltip,
} from 'choerodon-ui';
import { stores, axios } from 'choerodon-front-boot';
import _ from 'lodash';
import IssueStore from '../../../../stores/project/sprint/IssueStore';
import IssueFilterControler from '../IssueFilterControler';

const { AppState } = stores;
const FormItem = Form.Item;
@observer
class FilterManage extends Component {
    checkMyFilterNameRepeatUpdating = (rule, value, callback) => {
      const updateFilterName = IssueStore.getUpdateFilterName;
      if (updateFilterName === value) {
        callback();
      } else {
        this.checkMyFilterNameRepeat(value).then((res) => {
          if (res) {
            // Choerodon.prompt('筛选名称重复');
            callback('筛选名称重复');
          } else {
            callback();
          }
        });
      }
    }

    checkMyFilterNameRepeat = filterName => axios.get(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/check_name?userId=${AppState.userInfo.id}&name=${filterName}`)
    
    handleFNIBlurOrPressEnter = (filter, filterField) => {
      const editFilterInfo = IssueStore.getEditFilterInfo;
      const { form } = this.props;
      form.validateFields([filterField], (err, value, modify) => {
        if (!err && modify) {
          const myFilters = IssueStore.getMyFilters;
          IssueStore.setLoading(true);
          const updateData = {
            filterId: filter.filterId,
            objectVersionNumber: _.find(myFilters, item => item.filterId === filter.filterId).objectVersionNumber,
            // name: form.getFieldValue(filterField),
            name: value[filterField],
            projectId: AppState.currentMenuType.id,
            userId: AppState.userInfo.id,
          };
          axios.put(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/${filter.filterId}`, updateData).then((res) => {
            IssueStore.axiosGetMyFilterList();
            Choerodon.prompt('修改成功');
          }).catch(() => {
            IssueStore.setLoading(false);
            Choerodon.prompt('修改失败');
          });
        } else if (!modify) {
          IssueStore.setEditFilterInfo(_.map(editFilterInfo, item => Object.assign(item, { isEditing: false })));
        }
      });
    }

      
    render() {
      const filterListVisible = IssueStore.getFilterListVisible;
      const editFilterInfo = IssueStore.getEditFilterInfo;
      const myFilters = IssueStore.getMyFilters;
      const selectedFilterId = IssueStore.getSelectedFilterId;
      const { form } = this.props;
      const { getFieldDecorator } = form;
      const filterControler = new IssueFilterControler();
      return (
        <div 
          className="c7n-filterList"
          style={{ display: filterListVisible ? 'block' : 'none', width: 350 }}
        >
          <div className="c7n-filterList-header">
            <span>筛选管理</span>
            <Icon 
              type="close"
              onClick={() => {
                IssueStore.setFilterListVisible(false);
              }}
            />
          </div>
          {
            myFilters && myFilters.length > 0 && (
            <ul className="c7n-filterList-content">
                {
                myFilters.map(filter => (
                  <li key={filter.filterId} className="c7n-filterList-item">
                    {
                        filter && editFilterInfo && editFilterInfo.find(item => item.filterId === filter.filterId) && editFilterInfo.find(item => item.filterId === filter.filterId).isEditing ? (
                          <Form className="c7n-filterNameForm">
                            <FormItem>
                              {getFieldDecorator(`filterName_${filter.filterId}`, {
                                rules: [{
                                  required: true, message: '请输入筛选名称',
                                }, {
                                  validator: this.checkMyFilterNameRepeatUpdating,
                                }],
                                initialValue: filter.name,
                              })(
                                <Input
                                  className="c7n-filterNameInput"
                                  maxLength={10}
                                  onBlur={this.handleFNIBlurOrPressEnter.bind(this, filter, `filterName_${filter.filterId}`)}
                                  onPressEnter={this.handleFNIBlurOrPressEnter.bind(this, filter, `filterName_${filter.filterId}`)}
                                />,
                              )}
                            </FormItem>
                          </Form>
                        ) : (<span>{filter.name}</span>)
                    }
                    <span className="c7n-filterAction">
                      <Tooltip title="修改筛选名称">
                        <Icon
                          type="mode_edit"
                          onClick={() => {
                            const { isEditingIndex } = editFilterInfo.find(item => item.filterId === filter.filterId);
                            IssueStore.setUpdateFilterName(filter.name);
                            IssueStore.setEditFilterInfo([...(_.map(_.filter(editFilterInfo, item => item.isEditingIndex !== isEditingIndex), item => ({
                              ...item,
                              isEditing: false,
                            }))), {
                              filterId: filter.filterId,
                              isEditing: true,
                              isEditingIndex,
                            }]);
                          }}
                        />
                      </Tooltip>
                      <Tooltip title="删除筛选">
                        <Icon 
                          type="delete_forever" 
                          onClick={() => {
                            IssueStore.setLoading(true);
                            axios.delete(`/agile/v1/projects/${AppState.currentMenuType.id}/personal_filter/${filter.filterId}`)
                              .then((res) => {
                                IssueStore.axiosGetMyFilterList();
                                if (filter.filterId === selectedFilterId) {
                                  IssueStore.setSelectedFilterId(undefined);
                                  IssueStore.resetFilterSelect(filterControler);
                                }
                                Choerodon.prompt('删除成功');
                              }).catch(() => {
                                IssueStore.setLoading(false);
                                Choerodon.prompt('删除失败');
                              });
                          }}
                        />
                      </Tooltip>
                    </span>
                  </li>
                ))
                }
            </ul>
            )
        }
        </div>
      );
    }
}

export default Form.create()(FilterManage);