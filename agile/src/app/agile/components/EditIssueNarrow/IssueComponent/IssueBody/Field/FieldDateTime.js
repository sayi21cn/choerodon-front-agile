import React, { Component } from 'react';
import { observer, inject } from 'mobx-react';
import { withRouter } from 'react-router-dom';
import { injectIntl } from 'react-intl';
import TextEditToggle from '../../../../TextEditToggle';
import { DatetimeAgo } from '../../../../CommonComponent';

const { Text, Edit } = TextEditToggle;

@inject('AppState')
@observer class FieldDateTime extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
  }

  render() {
    const { store, field } = this.props;
    const { code, fieldName } = field;
    const issue = store.getIssue;
    const { [code]: value } = issue;
    return (
      <div className="line-start mt-10">
        <div className="c7n-property-wrapper">
          <span className="c7n-property">
            {`${fieldName}：`}
          </span>
        </div>
        <div className="c7n-value-wrapper">
          <TextEditToggle
            disabled
            originData={fieldName}
          >
            <Text>
              <DatetimeAgo
                date={value}
              />
            </Text>
            <Edit>
              <span>{value}</span>
            </Edit>
          </TextEditToggle>
        </div>
      </div>
    );
  }
}

export default withRouter(injectIntl(FieldDateTime));
