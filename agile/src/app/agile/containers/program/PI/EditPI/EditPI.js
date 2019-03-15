import React, { Component } from 'react';
import { observer } from 'mobx-react';
import {
  Button, Icon, Modal, Form, Select, Input, Checkbox,
} from 'choerodon-ui';
import {
  stores, Page, Header, Content,  
} from 'choerodon-front-boot';
import { values } from 'mobx';
import PIStore from '../../../../stores/Program/PI/PIStore';
import {
  createPIAims, getPIList, getPIAims, upDatePIAmix, 
} from '../../../../api/PIApi';

const { AppState } = stores;
const { Sidebar } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
const BV = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

@observer
class EditPI extends Component {
  handleOnOk = () => {
    const { editingPiAimsInfo, form } = this.props;
    PIStore.setPIDetailLoading(true);
    form.validateFields((err, values) => {
      if (!err) {
        const piObjectiveDTO = {
          id: editingPiAimsInfo.id,
          objectVersionNumber: editingPiAimsInfo.objectVersionNumber,
          piId: editingPiAimsInfo.piId,
          name: values.name,
          planBv: values.planBv,
          actualBv: values.actualBv,
          stretch: values.stretch,
          levelCode: 'program',
          programId: AppState.currentMenuType.projectId,
          projectId: AppState.currentMenuType.projectId,
        };
        upDatePIAmix(piObjectiveDTO).then((res) => {
          getPIAims(editingPiAimsInfo.piId).then((piAims) => {
            PIStore.setPiAims(piAims);
            PIStore.setEditPiAimsCtrl(piAims.program.map((item, index) => (
              {
                isEditing: false,
                editingId: item.id,
                editingIndex: index,  
              }
            )));
            PIStore.setPIDetailLoading(false);
            PIStore.setEditPIVisible(false);
          });
          Choerodon.prompt('修改成功');
          form.resetFields();
        }).catch(() => {
          PIStore.setPIDetailLoading(false);
          Choerodon.prompt('修改失败');
        });
      }
    });
  }

  handleOnCancel = () => {
    PIStore.setEditPIVisible(false);
  }

  
  render() {
    const { form, editingPiAimsInfo, editPIVisible } = this.props;
    const { getFieldDecorator } = form;
    return (
      <Sidebar
        className="c7n-pi-createPISideBar"
        title={`编辑${editingPiAimsInfo.name}`}
        visible={editPIVisible}
        cancelText="取消"
        okText="保存"
        onOk={this.handleOnOk}
        onCancel={this.handleOnCancel}
        destroyOnClose
      >
        <Form>
          <FormItem style={{ width: 520 }}>
            {getFieldDecorator('name', {
              rules: [{ required: true, message: 'PI目标名称为必输项' }],
              initialValue: editingPiAimsInfo.name,
            })(
              <Input label="PI目标名称" placeholder="请输入PI目标名称" maxLength={44} />,
            )}
          </FormItem>
          <FormItem style={{ width: 520 }}>
            {
                getFieldDecorator('planBv', { 
                  initialValue: editingPiAimsInfo.planBv, 
                })(
                  <Select label="计划商业价值">
                    {
                      BV.map(value => (<Option value={value}>{value}</Option>))
                    }
                  </Select>,
                )
              }
          </FormItem>
          <FormItem style={{ width: 520 }}>
            {
                getFieldDecorator('actualBv', {
                  initialValue: editingPiAimsInfo.actualBv,
                })(
                  <Select label="计划商业价值">
                    {
                      BV.map(value => (<Option value={value}>{value}</Option>))
                    }
                  </Select>,
                )
              }
          </FormItem>
          <FormItem>
            {
                getFieldDecorator('stretch', {
                  initialValue: editingPiAimsInfo.stretch,
                  valuePropName: 'checked',
                })(
                  <Checkbox>延伸目标</Checkbox>,
                )
              }
          </FormItem>
        </Form>
      </Sidebar>
    );
  }
}

export default Form.create()(EditPI);
