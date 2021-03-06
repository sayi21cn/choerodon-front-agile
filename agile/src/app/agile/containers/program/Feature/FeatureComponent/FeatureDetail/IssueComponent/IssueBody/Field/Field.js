import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import {
  Checkbox, Select, Input, TimePicker, Row, Col, Radio, DatePicker, InputNumber,
} from 'choerodon-ui';
import { injectIntl } from 'react-intl';
import { updateFieldValue } from '../../../../../../../../api/NewIssueApi';
import TextEditToggle from '../../../../../../../../components/TextEditToggle';
import FieldBlank from '../../../../CreateFeature/FieldBlank';

const { TextArea } = Input;
const { Option } = Select;
const { Text, Edit } = TextEditToggle;

@inject('AppState')
@observer class IssueField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newValue: '',
    };
  }

  componentDidMount() {

  }

  handleChange = (e) => {
    const { field } = this.props;
    const { fieldType } = field;
    if (fieldType === 'time' || fieldType === 'datetime') {
      this.setState({
        newValue: e && e.format('YYYY-MM-DD HH:mm:ss'),
      });
    } else if (e && e.target) {
      this.setState({
        newValue: e.target.value,
      });
    } else {
      this.setState({
        newValue: e,
      });
    }
  };

  updateIssueField = () => {
    const { newValue } = this.state;
    const {
      store, onUpdate, reloadIssue, field,
    } = this.props;
    const issue = store.getIssue;
    const {
      fieldId, fieldType, value, required, fieldName,
    } = field;
    const { issueId } = issue;
    if (required) {
      if (!newValue) {
        Choerodon.prompt(`${fieldName}必填！`);
        return;
      } else if (newValue instanceof Array && newValue.length === 0) {
        Choerodon.prompt(`${fieldName}必填！`);
        return;
      }
    }
    if (JSON.stringify(value) !== JSON.stringify(newValue)) {
      const obj = {
        fieldType,
        value: newValue,
      };
      updateFieldValue(issueId, fieldId, 'agile_issue', obj)
        .then(() => {
          if (onUpdate) {
            onUpdate();
          }
          if (reloadIssue) {
            reloadIssue();
          }
        });
    }
  };

  renderField = () => {
    const { field } = this.props;
    const { fieldValue } = this.state;
    const {
      fieldOptions, fieldType, required,
    } = field;
    if (fieldType === 'radio') {
      if (fieldOptions && fieldOptions.length > 0) {
        return (
          <Radio.Group
            className="fieldWith"
            onChange={e => this.handleChange(e)}
          >
            {fieldOptions && fieldOptions.length > 0
            && fieldOptions.map(item => (
              <Radio
                className="radioStyle"
                value={item.id}
                key={item.id}
              >
                {item.value}
              </Radio>
            ))}
          </Radio.Group>
        );
      } else {
        return (
          <FieldBlank />
        );
      }
    } else if (field.fieldType === 'checkbox') {
      if (fieldOptions && fieldOptions.length > 0) {
        return (
          <Checkbox.Group
            className="fieldWith"
            onChange={e => this.handleChange(e)}
          >
            <Row>
              {fieldOptions && fieldOptions.length > 0
              && fieldOptions.map(item => (
                <Col
                  span={24}
                  key={item.id}
                >
                  <Checkbox
                    value={item.id}
                    key={item.id}
                    className="checkboxStyle"
                  >
                    {item.value}
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        );
      } else {
        return (
          <FieldBlank />
        );
      }
    } else if (field.fieldType === 'time') {
      return (
        <TimePicker
          className="fieldWith"
          defaultOpenValue={moment('00:00:00', 'HH:mm:ss')}
          allowEmpty={!required}
          onChange={e => this.handleChange(e)}
        />
      );
    } else if (field.fieldType === 'datetime') {
      return (
        <DatePicker
          format="YYYY-MM-DD HH:mm:ss"
          className="fieldWith"
          allowClear={!required}
          onChange={e => this.handleChange(e)}
        />
      );
    } else if (field.fieldType === 'single') {
      return (
        <Select
          dropdownMatchSelectWidth
          className="fieldWith"
          allowClear={!required}
          onChange={e => this.handleChange(e)}
        >
          {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.map(item => (
            <Option
              value={item.id}
              key={item.id}
            >
              {item.value}
            </Option>
          ))}
        </Select>
      );
    } else if (field.fieldType === 'multiple') {
      return (
        <Select
          dropdownMatchSelectWidth
          mode="multiple"
          className="fieldWith"
          onChange={e => this.handleChange(e)}
        >
          {field.fieldOptions && field.fieldOptions.length > 0
          && field.fieldOptions.map(item => (
            <Option
              value={item.id}
              key={item.id}
            >
              {item.value}
            </Option>
          ))}
        </Select>
      );
    } else if (field.fieldType === 'number') {
      return (
        <InputNumber
          onChange={e => this.handleChange(e)}
          className="fieldWith"
          step={field.extraConfig === '1' ? 0.1 : 1}
        />
      );
    } else if (field.fieldType === 'text') {
      return (
        <TextArea
          className="fieldWith"
          onChange={e => this.handleChange(e)}
        />
      );
    } else {
      return (
        <Input
          className="fieldWith"
          onChange={e => this.handleChange(e)}
        />
      );
    }
  };

  transform = (fieldType, value) => {
    if (fieldType === 'time' || fieldType === 'datetime') {
      return value ? moment(value) : undefined;
    } else if (value instanceof Array) {
      return value.slice();
    } else {
      return value;
    }
  };

  render() {
    const { field } = this.props;
    const {
      fieldCode, fieldName, value, fieldType, valueStr,
    } = field;

    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            {`${fieldName}：`}
          </span>
        </div>
        <div className="c7n-value-wrapper" style={{ width: 'auto' }}>
          <TextEditToggle
            formKey={fieldCode}
            onSubmit={this.updateIssueField}
            originData={this.transform(fieldType, value)}
          >
            <Text key="text">
              <div>
                {valueStr || '无'}
              </div>
            </Text>
            <Edit key="edit">
              {this.renderField()}
            </Edit>
          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(IssueField));
